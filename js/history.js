(function () {
    "use strict";

    const dateFormatter = new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

    const timeFormatter = new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit"
    });

    const longDateFormatter = new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    function parseDate(value) {
        const date = value instanceof Date ? value : new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    function formatDate(value) {
        const date = parseDate(value);
        return date ? dateFormatter.format(date) : "Tanggal tidak diketahui";
    }

    function formatTime(value) {
        const date = parseDate(value);
        return date ? timeFormatter.format(date) : "Waktu tidak diketahui";
    }

    function formatLongDate(value) {
        const date = parseDate(value);
        return date ? longDateFormatter.format(date) : "Tanggal tidak diketahui";
    }

    function formatSessionName(value) {
        return `Sesi ${formatDate(value)}, ${formatTime(value)}`;
    }

    function createId() {
        if (window.crypto && typeof window.crypto.randomUUID === "function") {
            return `session-${window.crypto.randomUUID()}`;
        }

        return `session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    }

    function cloneMember(member) {
        const members = window.DeTim.members;
        return members.copyMember(member);
    }

    function cloneGroups(groups) {
        return groups.map((group) => ({
            id: group.id,
            name: group.name,
            members: group.members.map(cloneMember)
        }));
    }

    function rosterKey(member) {
        const members = window.DeTim.members;
        return `${members.nameKey(member)}\u0000${members.memberGender(member)}`;
    }

    function sameRoster(session, members, groupCount) {
        if (!session || !Array.isArray(session.members)) return false;
        if (session.members.length !== members.length) return false;
        if (session.groupCount !== groupCount) return false;

        const current = members.map(rosterKey).sort();
        const stored = session.members.map(rosterKey).sort();
        return current.every((key, index) => key === stored[index]);
    }

    function createSession(members, groupCount, groups, date) {
        const created = parseDate(date) || new Date();
        const iso = created.toISOString();

        return {
            id: createId(),
            name: formatSessionName(iso),
            createdAt: iso,
            updatedAt: iso,
            members: members.map(cloneMember),
            groupCount,
            groups: cloneGroups(groups)
        };
    }

    function upsert(history, activeSessionId, payload) {
        const sessions = Array.isArray(history) ? history : [];
        const activeIndex = sessions.findIndex((session) => session.id === activeSessionId);

        if (activeIndex >= 0 && sameRoster(sessions[activeIndex], payload.members, payload.groupCount)) {
            const updated = {
                ...sessions[activeIndex],
                updatedAt: new Date().toISOString(),
                members: payload.members.map(cloneMember),
                groupCount: payload.groupCount,
                groups: cloneGroups(payload.groups)
            };

            const next = [...sessions];
            next[activeIndex] = updated;
            return { history: next, session: updated, updated: true };
        }

        const session = createSession(
            payload.members,
            payload.groupCount,
            payload.groups
        );

        const max = window.DeTim.storage.MAX_HISTORY;
        const next = [session, ...sessions].slice(0, max);

        return { history: next, session, updated: false };
    }

    function remove(history, sessionId) {
        return (Array.isArray(history) ? history : [])
            .filter((session) => session.id !== sessionId);
    }

    function find(history, sessionId) {
        if (!Array.isArray(history)) return null;
        return history.find((session) => session.id === sessionId) || null;
    }

    const app = window.DeTim = window.DeTim || {};

    app.history = {
        formatDate,
        formatTime,
        formatLongDate,
        formatSessionName,
        createSession,
        upsert,
        remove,
        find,
        sameRoster
    };
})();
