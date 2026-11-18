(function () {
    "use strict";

    const KEY = "detim_app_data";
    const VERSION = 2;
    const SUPPORTED_VERSIONS = [1, 2];
    const MAX_HISTORY = 20;
    const THEMES = ["light", "dark"];

    let availability = null;

    function nowIso() {
        return new Date().toISOString();
    }

    function isPlainObject(value) {
        return value !== null && typeof value === "object" && !Array.isArray(value);
    }

    function normalizeName(value) {
        if (typeof value !== "string") return "";
        return value.replace(/\s+/g, " ").trim();
    }

    function normalizeGender(value) {
        return value === "male" || value === "female" ? value : "";
    }

    function normalizeMembers(value) {
        if (!Array.isArray(value)) return [];

        const seen = new Set();
        const members = [];

        value.forEach((entry) => {
            const name = normalizeName(
                typeof entry === "string" ? entry : entry && entry.name
            );
            if (!name) return;

            const key = name.toLowerCase();
            if (seen.has(key)) return;

            seen.add(key);
            members.push({
                name,
                gender: entry && typeof entry === "object" ? normalizeGender(entry.gender) : ""
            });
        });

        return members;
    }

    function normalizeGroups(value) {
        if (!Array.isArray(value)) return [];

        return value.reduce((groups, entry, index) => {
            if (!isPlainObject(entry)) return groups;

            const members = normalizeMembers(entry.members);
            if (members.length === 0) return groups;

            const name = normalizeName(entry.name) || `Kelompok ${index + 1}`;
            const id = typeof entry.id === "string" && entry.id.trim()
                ? entry.id.trim()
                : `group-${index + 1}`;

            groups.push({ id, name, members });
            return groups;
        }, []);
    }

    function safeDate(value, fallback) {
        if (typeof value !== "string") return fallback;
        const time = Date.parse(value);
        return Number.isNaN(time) ? fallback : new Date(time).toISOString();
    }

    function normalizeSession(value) {
        if (!isPlainObject(value)) return null;

        const members = normalizeMembers(value.members);
        const groups = normalizeGroups(value.groups);
        if (members.length === 0 || groups.length === 0) return null;

        const createdAt = safeDate(value.createdAt, nowIso());
        const groupCount = Number.isInteger(value.groupCount)
            ? Math.min(Math.max(value.groupCount, 1), members.length)
            : groups.length;

        const id = typeof value.id === "string" && value.id.trim()
            ? value.id.trim()
            : `session-${createdAt}`;

        return {
            id,
            name: normalizeName(value.name) || `Sesi ${createdAt.slice(0, 10)}`,
            createdAt,
            updatedAt: safeDate(value.updatedAt, createdAt),
            members,
            groupCount,
            groups
        };
    }

    function normalizeHistory(value, activeSessionId) {
        if (!Array.isArray(value)) {
            return { history: [], activeSessionId: null };
        }

        const ids = new Set();
        const history = [];

        value.forEach((entry, index) => {
            const session = normalizeSession(entry);
            if (!session) return;

            if (ids.has(session.id)) {
                session.id = `${session.id}-${index + 1}`;
            }
            ids.add(session.id);
            history.push(session);
        });

        const trimmed = history.slice(0, MAX_HISTORY);
        const validActiveId = typeof activeSessionId === "string"
            && trimmed.some((session) => session.id === activeSessionId)
            ? activeSessionId
            : null;

        return { history: trimmed, activeSessionId: validActiveId };
    }

    function defaultData() {
        return {
            version: VERSION,
            members: [],
            groupCount: 2,
            groups: [],
            history: [],
            activeSessionId: null,
            settings: { theme: "light" },
            updatedAt: nowIso()
        };
    }

    function validate(raw) {
        if (!isPlainObject(raw) || !SUPPORTED_VERSIONS.includes(raw.version)) return null;

        const data = defaultData();
        data.members = normalizeMembers(raw.members);
        data.groups = normalizeGroups(raw.groups);

        const storedCount = Number.isInteger(raw.groupCount) ? raw.groupCount : 2;
        if (data.members.length === 0) {
            data.groupCount = 2;
        } else {
            data.groupCount = Math.min(Math.max(storedCount, 1), data.members.length);
        }

        const normalizedHistory = normalizeHistory(raw.history, raw.activeSessionId);
        data.history = normalizedHistory.history;
        data.activeSessionId = normalizedHistory.activeSessionId;

        const theme = isPlainObject(raw.settings) ? raw.settings.theme : null;
        data.settings.theme = THEMES.includes(theme) ? theme : "light";
        data.updatedAt = safeDate(raw.updatedAt, nowIso());

        return data;
    }

    function isAvailable() {
        if (availability !== null) return availability;

        try {
            const probe = "__detim_probe__";
            window.localStorage.setItem(probe, "1");
            window.localStorage.removeItem(probe);
            availability = true;
        } catch (error) {
            availability = false;
        }

        return availability;
    }

    function read() {
        if (!isAvailable()) {
            return {
                data: defaultData(),
                status: "unavailable",
                error: null
            };
        }

        let raw;
        try {
            raw = window.localStorage.getItem(KEY);
        } catch (error) {
            availability = false;
            return { data: defaultData(), status: "unavailable", error: null };
        }

        if (!raw) {
            return { data: defaultData(), status: "empty", error: null };
        }

        let parsed;
        try {
            parsed = JSON.parse(raw);
        } catch (error) {
            return {
                data: defaultData(),
                status: "invalid",
                error: "JSON tidak valid"
            };
        }

        const data = validate(parsed);
        if (!data) {
            return {
                data: defaultData(),
                status: "invalid",
                error: "Struktur data tidak dikenali"
            };
        }

        return { data, status: "ok", error: null };
    }

    function write(data) {
        if (!isAvailable()) {
            return { ok: false, code: "unavailable" };
        }

        const validated = validate(data);
        if (!validated) {
            return { ok: false, code: "invalid" };
        }

        validated.updatedAt = nowIso();

        try {
            window.localStorage.setItem(KEY, JSON.stringify(validated));
            return { ok: true, data: validated };
        } catch (error) {
            if (error && (error.name === "QuotaExceededError" || error.code === 22)) {
                return { ok: false, code: "quota" };
            }

            if (error && error.name === "SecurityError") {
                availability = false;
                return { ok: false, code: "unavailable" };
            }

            return { ok: false, code: "write" };
        }
    }

    function update(mutator) {
        const result = read();
        if (result.status === "unavailable" || result.status === "invalid") {
            return { ok: false, code: result.status };
        }

        let next;
        try {
            next = mutator(result.data);
        } catch (error) {
            return { ok: false, code: "write" };
        }

        return write(next);
    }

    function remove() {
        if (!isAvailable()) {
            return { ok: false, code: "unavailable" };
        }

        try {
            window.localStorage.removeItem(KEY);
            return { ok: true };
        } catch (error) {
            return { ok: false, code: "write" };
        }
    }

    function getStoredTheme() {
        try {
            const raw = window.localStorage.getItem(KEY);
            if (!raw) return "light";

            const parsed = JSON.parse(raw);
            const theme = parsed && parsed.settings ? parsed.settings.theme : null;
            return THEMES.includes(theme) ? theme : "light";
        } catch (error) {
            return "light";
        }
    }

    const app = window.DeTim = window.DeTim || {};

    app.storage = {
        KEY,
        VERSION,
        MAX_HISTORY,
        isAvailable,
        read,
        write,
        update,
        remove,
        validate,
        getStoredTheme,
        createDefault: defaultData
    };
})();
