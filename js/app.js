(function () {
    "use strict";

    const storage = window.DeTim.storage;
    const grouping = window.DeTim.grouping;
    const memberTools = window.DeTim.members;
    const historyTools = window.DeTim.history;
    const exporter = window.DeTim.exporter;

    const byId = (id) => document.getElementById(id);

    const dom = {
        themeColor: byId("themeColor"),
        storageNotice: byId("storageNotice"),
        storageNoticeText: byId("storageNoticeText"),
        memberForm: byId("memberForm"),
        memberInput: byId("memberInput"),
        memberGenderInput: byId("memberGenderInput"),
        memberStatus: byId("memberStatus"),
        duplicateStatus: byId("duplicateStatus"),
        memberError: byId("memberError"),
        addMembersBtn: byId("addMembersBtn"),
        clearInputBtn: byId("clearInputBtn"),
        membersList: byId("membersList"),
        membersCount: byId("membersCount"),
        membersEmpty: byId("membersEmpty"),
        clearMembersBtn: byId("clearMembersBtn"),
        configForm: byId("configForm"),
        groupCountInput: byId("groupCountInput"),
        groupCountHint: byId("groupCountHint"),
        groupCountError: byId("groupCountError"),
        distributionHint: byId("distributionHint"),
        decreaseGroups: byId("decreaseGroups"),
        increaseGroups: byId("increaseGroups"),
        generateBtn: byId("generateBtn"),
        resultsTitle: byId("resultsTitle"),
        resultStatus: byId("resultStatus"),
        resultMeta: byId("resultMeta"),
        resultActions: byId("resultActions"),
        regenerateBtn: byId("regenerateBtn"),
        copyAllBtn: byId("copyAllBtn"),
        downloadBtn: byId("downloadBtn"),
        printBtn: byId("printBtn"),
        staleBanner: byId("staleBanner"),
        staleMessage: byId("staleMessage"),
        refreshStaleBtn: byId("refreshStaleBtn"),
        resultsEmpty: byId("resultsEmpty"),
        groupsGrid: byId("groupsGrid"),
        historyList: byId("historyList"),
        historyEmpty: byId("historyEmpty"),
        clearHistoryBtn: byId("clearHistoryBtn"),
        resetSessionBtn: byId("resetSessionBtn"),
        deleteAllBtn: byId("deleteAllBtn"),
        toastRegion: byId("toastRegion"),
        confirmDialog: byId("confirmDialog"),
        confirmTitle: byId("confirmTitle"),
        confirmMessage: byId("confirmMessage"),
        confirmAccept: byId("confirmAccept"),
        printView: byId("printView")
    };


    let state = storage.createDefault();
    let editingMemberIndex = null;
    let editingGroupIndex = null;
    let storageIssue = null;
    let readWarning = null;
    let lastStorageCode = null;

    function createIcon(name, className) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", className || "icon");
        svg.setAttribute("aria-hidden", "true");

        const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
        use.setAttribute("href", `#${name}`);
        svg.appendChild(use);
        return svg;
    }

    function createElement(tag, className, text) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text != null) element.textContent = text;
        return element;
    }

    function setStatus(element, text, tone) {
        element.textContent = text;
        element.className = `status status--${tone}`;
    }

    function genderBadge(gender) {
        if (gender !== "male" && gender !== "female") return null;

        const badge = createElement("span", "gender-badge", gender === "male" ? "L" : "P");
        const label = memberTools.genderLabel(gender);
        badge.title = label;
        badge.setAttribute("aria-label", label);
        return badge;
    }

    function genderSummary(members) {
        const male = members.filter((member) => memberTools.memberGender(member) === "male").length;
        const female = members.filter((member) => memberTools.memberGender(member) === "female").length;
        const parts = [];

        if (male > 0) parts.push(`${male} L`);
        if (female > 0) parts.push(`${female} P`);
        return parts.join(" · ");
    }

    function memberLabel(count) {
        return `${count} anggota`;
    }

    function groupLabel(count) {
        return `${count} kelompok`;
    }

    function prefersReducedMotion() {
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    function notify(message, type, options) {
        const settings = options || {};
        const toastType = type || "success";
        const toast = createElement("div", `toast toast--${toastType}`);
        toast.setAttribute("role", toastType === "error" ? "alert" : "status");

        const iconName = toastType === "success" || toastType === "info"
            ? "i-check"
            : "i-alert";
        const icon = createIcon(iconName, "icon toast__icon");
        toast.appendChild(icon);

        const body = createElement("div", "toast__body");
        body.appendChild(createElement("p", "toast__message", message));

        if (settings.action) {
            const action = createElement("button", "toast__action", settings.action.label);
            action.type = "button";
            action.addEventListener("click", () => {
                remove();
                settings.action.onClick();
            });
            body.appendChild(action);
        }

        toast.appendChild(body);

        const close = createElement("button", "toast__close");
        close.type = "button";
        close.setAttribute("aria-label", "Tutup notifikasi");
        close.appendChild(createIcon("i-x"));
        toast.appendChild(close);

        let remaining = settings.duration || (toastType === "error" ? 7000 : 5200);
        let timer = null;
        let startedAt = Date.now();

        const remove = () => {
            window.clearTimeout(timer);
            toast.remove();
        };

        const startTimer = () => {
            startedAt = Date.now();
            timer = window.setTimeout(remove, remaining);
        };

        close.addEventListener("click", remove);
        toast.addEventListener("mouseenter", () => {
            window.clearTimeout(timer);
            remaining -= Date.now() - startedAt;
        });
        toast.addEventListener("mouseleave", () => {
            if (remaining > 400) startTimer();
        });

        while (dom.toastRegion.children.length >= 3) {
            dom.toastRegion.firstElementChild.remove();
        }

        dom.toastRegion.appendChild(toast);
        startTimer();
    }

    function confirmAction(options) {
        if (typeof dom.confirmDialog.showModal !== "function") {
            return Promise.resolve(window.confirm(`${options.title}\n\n${options.message}`));
        }

        if (dom.confirmDialog.open) return Promise.resolve(false);

        dom.confirmTitle.textContent = options.title;
        dom.confirmMessage.textContent = options.message;
        dom.confirmAccept.textContent = options.confirmLabel || "Hapus";
        dom.confirmAccept.className = options.tone === "primary"
            ? "btn btn--primary"
            : "btn btn--danger";
        dom.confirmDialog.returnValue = "";

        return new Promise((resolve) => {
            const onClose = () => {
                dom.confirmDialog.removeEventListener("close", onClose);
                resolve(dom.confirmDialog.returnValue === "confirm");
            };

            dom.confirmDialog.addEventListener("close", onClose);
            dom.confirmDialog.showModal();
        });
    }

    function applyTheme(theme) {
        const resolved = theme === "dark" ? "dark" : "light";
        state.settings.theme = resolved;

        document.documentElement.setAttribute("data-theme", resolved);
        dom.themeColor.setAttribute("content", resolved === "dark" ? "#1C1216" : "#FBF7EE");
    }

    function handleStorageFailure(code) {
        if (code === "quota") {
            storageIssue = "quota";
        } else if (code === "unavailable") {
            storageIssue = "unavailable";
        } else if (code === "invalid") {
            storageIssue = "write";
        } else {
            storageIssue = "write";
        }

        const messages = {
            quota: "Penyimpanan perangkat penuh. Hapus sebagian riwayat agar perubahan baru dapat disimpan.",
            unavailable: "Penyimpanan lokal tidak tersedia. Data hanya bertahan selama tab ini terbuka.",
            invalid: "Data gagal disimpan di perangkat ini.",
            write: "Data gagal disimpan di perangkat ini."
        };

        if (lastStorageCode !== code) {
            notify(messages[code] || messages.write, "error");
            lastStorageCode = code;
        }

        renderStorageStatus();
    }

    function renderStorageStatus() {
        const available = storage.isAvailable();
        let notice = "";

        if (!available || storageIssue === "unavailable") {
            notice = "Penyimpanan lokal tidak tersedia di browser ini. Data hanya bertahan selama tab terbuka. Unduh hasil sebagai TXT agar tidak hilang.";
        } else if (storageIssue === "quota") {
            notice = "Penyimpanan perangkat penuh. Perubahan tetap ada di tab ini, tetapi tidak akan bertahan setelah halaman ditutup. Hapus sebagian riwayat untuk melanjutkan penyimpanan.";
        } else if (storageIssue === "write") {
            notice = "Data gagal disimpan di perangkat ini. Unduh hasil sebagai TXT agar tidak hilang.";
        } else if (readWarning) {
            notice = readWarning;
        }

        dom.storageNoticeText.textContent = notice;
        dom.storageNotice.hidden = !notice;
    }

    function persist() {
        state.updatedAt = new Date().toISOString();
        const result = storage.write(state);

        if (!result.ok) {
            handleStorageFailure(result.code);
            return false;
        }

        if (result.data) state.updatedAt = result.data.updatedAt;
        storageIssue = null;
        readWarning = null;
        lastStorageCode = null;
        renderStorageStatus();
        return true;
    }

    function normalizeGroupCount() {
        if (state.members.length === 0) {
            state.groupCount = 2;
            return;
        }

        const count = Number.isInteger(state.groupCount) ? state.groupCount : 1;
        state.groupCount = Math.min(Math.max(count, 1), state.members.length);
    }

    function updateInputPreview() {
        const analysis = memberTools.analyze(dom.memberInput.value, state.members);

        if (analysis.detected === 0) {
            dom.memberStatus.textContent = "Belum ada nama di kolom input.";
        } else {
            dom.memberStatus.textContent = `${analysis.detected} nama terdeteksi. ${analysis.newNames.length} siap ditambahkan.`;
        }

        if (analysis.duplicates.length === 0) {
            dom.duplicateStatus.hidden = true;
            dom.duplicateStatus.textContent = "";
            return;
        }

        const names = [...new Set(analysis.duplicates.map((entry) => entry.name))];
        const preview = names.slice(0, 3).join(", ");
        const rest = names.length > 3 ? ` dan ${names.length - 3} nama lain` : "";

        dom.duplicateStatus.textContent = `${analysis.duplicates.length} nama ganda atau sudah terdaftar akan dilewati: ${preview}${rest}.`;
        dom.duplicateStatus.hidden = false;
    }

    function showMemberError(message) {
        dom.memberError.textContent = message;
        dom.memberError.hidden = false;
        dom.memberInput.classList.add("is-invalid");
        dom.memberInput.setAttribute("aria-invalid", "true");
        dom.memberInput.focus();
    }

    function clearMemberError() {
        dom.memberError.hidden = true;
        dom.memberError.textContent = "";
        dom.memberInput.classList.remove("is-invalid");
        dom.memberInput.removeAttribute("aria-invalid");
    }

    function showGroupError(message, focusInput) {
        dom.groupCountError.textContent = message;
        dom.groupCountError.hidden = false;
        dom.groupCountInput.classList.add("is-invalid");
        dom.groupCountInput.setAttribute("aria-invalid", "true");

        if (focusInput !== false) {
            dom.groupCountInput.focus();
            dom.groupCountInput.select();
        }
    }

    function clearGroupError() {
        dom.groupCountError.hidden = true;
        dom.groupCountError.textContent = "";
        dom.groupCountInput.classList.remove("is-invalid");
        dom.groupCountInput.removeAttribute("aria-invalid");
    }

    function updateDistributionPreview() {
        const membersCount = state.members.length;

        if (membersCount === 0) {
            dom.distributionHint.textContent = "Tambahkan anggota untuk melihat pembagian.";
            return;
        }

        const distribution = grouping.describeDistribution(membersCount, state.groupCount);
        if (!distribution) {
            dom.distributionHint.textContent = "Periksa jumlah kelompok.";
            return;
        }

        if (distribution.min === distribution.max) {
            dom.distributionHint.textContent = `Setiap kelompok berisi ${distribution.min} anggota.`;
            return;
        }

        dom.distributionHint.textContent = `${distribution.largeGroups} kelompok berisi ${distribution.max} anggota, ${distribution.smallGroups} kelompok berisi ${distribution.min} anggota.`;
    }

    function renderMembers() {
        const count = state.members.length;
        dom.membersCount.textContent = memberLabel(count);
        dom.clearMembersBtn.disabled = count === 0;
        dom.membersEmpty.hidden = count > 0;

        const fragment = document.createDocumentFragment();

        state.members.forEach((member, index) => {
            const name = memberTools.memberName(member);
            const row = createElement("li", `member-row${editingMemberIndex === index ? " member-row--editing" : ""}`);
            row.dataset.index = String(index);

            if (editingMemberIndex === index) {
                const form = createElement("form", "member-edit-form");
                form.dataset.editMember = String(index);

                const input = createElement("input", "inline-input");
                input.type = "text";
                input.value = name;
                input.autocomplete = "off";
                input.setAttribute("aria-label", `Ubah nama anggota ${index + 1}`);

                const select = createElement("select", "inline-select");
                select.setAttribute("aria-label", `Jenis kelamin ${name}`);
                [
                    ["", "Belum diisi"],
                    ["male", "Laki-laki"],
                    ["female", "Perempuan"]
                ].forEach(([value, label]) => {
                    const option = createElement("option", "", label);
                    option.value = value;
                    select.appendChild(option);
                });
                select.value = memberTools.memberGender(member);

                const save = createElement("button", "row-action");
                save.type = "submit";
                save.setAttribute("aria-label", "Simpan data anggota");
                save.appendChild(createIcon("i-check"));

                const cancel = createElement("button", "row-action");
                cancel.type = "button";
                cancel.dataset.action = "cancel-edit-member";
                cancel.dataset.index = String(index);
                cancel.setAttribute("aria-label", "Batalkan perubahan anggota");
                cancel.appendChild(createIcon("i-x"));

                form.append(input, select, save, cancel);
                row.appendChild(form);
            } else {
                const number = createElement("span", "member-index", String(index + 1).padStart(2, "0"));
                const label = createElement("span", "member-id");
                label.appendChild(createElement("span", "member-name", name));

                const badge = genderBadge(memberTools.memberGender(member));
                if (badge) label.appendChild(badge);

                const actions = createElement("div", "member-actions");
                const edit = createElement("button", "row-action");
                edit.type = "button";
                edit.dataset.action = "edit-member";
                edit.dataset.index = String(index);
                edit.setAttribute("aria-label", `Ubah data ${name}`);
                edit.appendChild(createIcon("i-pencil"));

                const remove = createElement("button", "row-action row-action--danger");
                remove.type = "button";
                remove.dataset.action = "delete-member";
                remove.dataset.index = String(index);
                remove.setAttribute("aria-label", `Hapus ${name}`);
                remove.appendChild(createIcon("i-trash"));

                actions.append(edit, remove);
                row.append(number, label, actions);
            }

            fragment.appendChild(row);
        });

        dom.membersList.replaceChildren(fragment);

        if (editingMemberIndex !== null) {
            const input = dom.membersList.querySelector(".member-row--editing .inline-input");
            if (input) {
                input.focus();
                input.select();
            }
        }
    }

    function renderConfig() {
        const max = state.members.length > 0 ? state.members.length : 2;
        dom.groupCountInput.max = String(max);
        dom.groupCountInput.value = String(state.groupCount);

        if (state.members.length === 0) {
            dom.groupCountHint.textContent = "Tambahkan anggota terlebih dahulu.";
        } else if (state.members.length === 1) {
            dom.groupCountHint.textContent = "Tersedia 1 kelompok untuk 1 anggota.";
        } else {
            dom.groupCountHint.textContent = `Tentukan antara 1 dan ${state.members.length}.`;
        }

        updateDistributionPreview();
        clearGroupError();
    }

    function renderResults() {
        const hasGroups = state.groups.length > 0;

        dom.resultActions.hidden = !hasGroups;
        dom.resultsEmpty.hidden = hasGroups;
        dom.groupsGrid.hidden = !hasGroups;
        dom.resultStatus.hidden = !hasGroups;

        if (!hasGroups) {
            dom.groupsGrid.replaceChildren();
            dom.staleBanner.hidden = true;
            dom.resultMeta.textContent = "Belum ada hasil. Buat kelompok pertama Anda dari daftar anggota.";
            return;
        }

        const stale = getStaleState();
        const resultMemberCount = state.groups.reduce((total, group) => total + group.members.length, 0);
        const session = historyTools.find(state.history, state.activeSessionId);

        const metaParts = [
            session ? session.name : "Hasil saat ini",
            memberLabel(resultMemberCount),
            groupLabel(state.groups.length)
        ];

        if (session) {
            const updated = new Date(session.updatedAt).getTime() - new Date(session.createdAt).getTime();
            if (updated > 60000) {
                metaParts.push(`Diperbarui ${historyTools.formatTime(session.updatedAt)}`);
            }
        }

        dom.resultMeta.textContent = metaParts.join(" · ");
        setStatus(dom.resultStatus, stale.stale ? "Kedaluwarsa" : "Sesuai data", stale.stale ? "warning" : "success");

        dom.staleBanner.hidden = !stale.stale;
        if (stale.stale) {
            dom.staleMessage.textContent = stale.message;
            dom.refreshStaleBtn.hidden = state.members.length === 0;
        }

        dom.groupsGrid.dataset.stale = String(stale.stale);
        renderGroupCards();

        if (editingGroupIndex !== null) {
            const input = dom.groupsGrid.querySelector(".group-rename .inline-input");
            if (input) {
                input.focus();
                input.select();
            }
        }
    }

    function renderGroupCards() {
        const fragment = document.createDocumentFragment();

        state.groups.forEach((group, index) => {
            const card = createElement("article", "group-card");
            const counts = genderSummary(group.members);
            const countText = counts
                ? `${memberLabel(group.members.length)} · ${counts}`
                : memberLabel(group.members.length);

            const head = createElement("header", "group-card__head");
            const ordinal = createElement("span", "group-index", String(index + 1).padStart(2, "0"));
            const heading = createElement("div", "group-heading");

            if (editingGroupIndex === index) {
                const form = createElement("form", "group-rename");
                form.dataset.renameGroup = String(index);

                const input = createElement("input", "inline-input");
                input.type = "text";
                input.value = group.name;
                input.autocomplete = "off";
                input.setAttribute("aria-label", `Ubah nama kelompok ${index + 1}`);

                const save = createElement("button", "row-action");
                save.type = "submit";
                save.setAttribute("aria-label", "Simpan nama kelompok");
                save.appendChild(createIcon("i-check"));

                const cancel = createElement("button", "row-action");
                cancel.type = "button";
                cancel.dataset.action = "cancel-rename-group";
                cancel.dataset.index = String(index);
                cancel.setAttribute("aria-label", "Batalkan perubahan nama kelompok");
                cancel.appendChild(createIcon("i-x"));

                form.append(input, save, cancel);
                heading.appendChild(form);
                heading.appendChild(createElement("p", "group-count", countText));
            } else {
                heading.appendChild(createElement("h3", "group-name", group.name));
                heading.appendChild(createElement("p", "group-count", countText));
            }

            const tools = createElement("div", "group-tools");

            const copy = createElement("button", "row-action");
            copy.type = "button";
            copy.dataset.action = "copy-group";
            copy.dataset.index = String(index);
            copy.setAttribute("aria-label", `Salin ${group.name}`);
            copy.appendChild(createIcon("i-copy"));

            const edit = createElement("button", "row-action");
            edit.type = "button";
            edit.dataset.action = "edit-group";
            edit.dataset.index = String(index);
            edit.setAttribute("aria-label", `Ubah nama ${group.name}`);
            edit.appendChild(createIcon("i-pencil"));

            tools.append(copy, edit);
            head.append(ordinal, heading, tools);

            const list = createElement("ol", "group-members");
            group.members.forEach((member, memberIndex) => {
                const item = createElement("li", "group-member");
                item.appendChild(createElement("span", "group-member-index", String(memberIndex + 1)));
                item.appendChild(createElement("span", "group-member-name", memberTools.memberName(member)));

                const badge = genderBadge(memberTools.memberGender(member));
                if (badge) item.appendChild(badge);

                list.appendChild(item);
            });

            card.append(head, list);
            fragment.appendChild(card);
        });

        dom.groupsGrid.replaceChildren(fragment);
    }

    function renderHistory() {
        const hasHistory = state.history.length > 0;
        dom.clearHistoryBtn.disabled = !hasHistory;
        dom.historyEmpty.hidden = hasHistory;
        dom.historyList.hidden = !hasHistory;

        if (!hasHistory) {
            dom.historyList.replaceChildren();
            return;
        }

        const fragment = document.createDocumentFragment();

        state.history.forEach((session) => {
            const active = session.id === state.activeSessionId;
            const row = createElement("li", `history-row${active ? " history-row--active" : ""}`);
            row.dataset.sessionId = session.id;

            const main = createElement("div", "history-main");
            const nameLine = createElement("div", "history-name-line");
            nameLine.appendChild(createElement("span", "history-name", session.name));

            if (active) {
                const badge = createElement("span", "status status--success", "Sedang ditampilkan");
                nameLine.appendChild(badge);
            }

            const meta = createElement("p", "history-meta", `${memberLabel(session.members.length)} · ${groupLabel(session.groupCount)}`);

            main.append(nameLine, meta);

            const actions = createElement("div", "history-actions");

            const open = createElement("button", "btn btn--secondary", "Buka");
            open.type = "button";
            open.dataset.action = "open-session";
            open.dataset.sessionId = session.id;
            open.setAttribute("aria-label", `Buka ${session.name}`);

            const remove = createElement("button", "icon-button");
            remove.type = "button";
            remove.dataset.action = "delete-session";
            remove.dataset.sessionId = session.id;
            remove.setAttribute("aria-label", `Hapus ${session.name}`);
            remove.appendChild(createIcon("i-trash"));

            actions.append(open, remove);
            row.append(main, actions);
            fragment.appendChild(row);
        });

        dom.historyList.replaceChildren(fragment);
    }

    function getStaleState() {
        if (state.groups.length === 0) {
            return { stale: false, reason: "", message: "" };
        }

        const memberSignature = (member) => (
            `${memberTools.nameKey(member)}\u0000${memberTools.memberGender(member)}`
        );
        const reportedMembers = state.groups
            .flatMap((group) => group.members)
            .map(memberSignature)
            .sort();
        const currentMembers = state.members
            .map(memberSignature)
            .sort();

        const membersDiffer = reportedMembers.length !== currentMembers.length
            || currentMembers.some((signature, index) => signature !== reportedMembers[index]);

        if (membersDiffer) {
            return {
                stale: true,
                reason: "members",
                message: state.members.length === 0
                    ? "Daftar anggota sekarang kosong. Hasil di bawah berasal dari daftar sebelumnya."
                    : "Daftar anggota berubah setelah hasil ini dibuat. Acak ulang agar semua anggota terbaru ikut terbagi."
            };
        }

        if (state.groups.length !== state.groupCount) {
            return {
                stale: true,
                reason: "count",
                message: "Jumlah kelompok yang diminta berbeda dengan hasil yang ditampilkan. Acak ulang untuk menyesuaikan."
            };
        }

        return { stale: false, reason: "", message: "" };
    }

    function updateResultStaleness() {
        if (state.groups.length === 0) return;

        const stale = getStaleState();
        setStatus(dom.resultStatus, stale.stale ? "Kedaluwarsa" : "Sesuai data", stale.stale ? "warning" : "success");
        dom.staleBanner.hidden = !stale.stale;
        dom.groupsGrid.dataset.stale = String(stale.stale);

        if (stale.stale) {
            dom.staleMessage.textContent = stale.message;
            dom.refreshStaleBtn.hidden = state.members.length === 0;
        }
    }

    function renderAll() {
        renderStorageStatus();
        renderMembers();
        renderConfig();
        updateInputPreview();
        renderResults();
        renderHistory();
    }

    function getExportMeta() {
        const session = historyTools.find(state.history, state.activeSessionId);
        const flattened = state.groups.reduce((total, group) => total + group.members.length, 0);

        return {
            sessionName: session ? session.name : "Hasil saat ini",
            createdAt: session ? session.createdAt : state.updatedAt,
            memberCount: flattened,
            groupCount: state.groups.length,
            stale: getStaleState().stale
        };
    }

    function scrollToResults() {
        const section = byId("hasil");
        section.scrollIntoView({
            behavior: prefersReducedMotion() ? "auto" : "smooth",
            block: "start"
        });
        dom.resultsTitle.focus({ preventScroll: true });
    }

    function focusMemberAction(index, action) {
        const button = dom.membersList.querySelector(`[data-action="${action}"][data-index="${index}"]`);
        if (button) button.focus();
    }

    function focusGroupEdit(index) {
        const button = dom.groupsGrid.querySelector(`[data-action="edit-group"][data-index="${index}"]`);
        if (button) button.focus();
    }

    function addMembersFromInput() {
        const text = dom.memberInput.value;

        if (!text.trim()) {
            showMemberError("Isi minimal satu nama sebelum menambahkan anggota.");
            return;
        }

        const result = memberTools.addMembers(state.members, text, dom.memberGenderInput.value);

        if (result.newNames.length === 0) {
            const message = "Tidak ada anggota baru. Semua nama sudah terdaftar atau ganda.";
            dom.duplicateStatus.textContent = message;
            dom.duplicateStatus.hidden = false;
            notify(message, "warning");
            dom.memberInput.focus();
            return;
        }

        state.members = result.members;
        normalizeGroupCount();
        editingMemberIndex = null;
        dom.memberInput.value = "";
        clearMemberError();
        updateInputPreview();
        persist();
        renderAll();
        dom.memberInput.focus();

        const added = `${result.newNames.length} anggota ditambahkan.`;
        const skipped = result.duplicates.length > 0
            ? ` ${result.duplicates.length} nama ganda dilewati.`
            : "";
        notify(added + skipped, "success");
    }

    function saveMemberEdit(index, value, gender) {
        const previous = state.members[index];
        const result = memberTools.renameMember(state.members, index, value, gender);

        if (!result.ok) {
            notify(result.message, "error");
            const input = dom.membersList.querySelector(".member-row--editing .inline-input");
            if (input) {
                input.classList.add("is-invalid");
                input.focus();
                input.select();
            }
            return;
        }

        const current = result.members[index];
        const changed = previous !== undefined && (
            memberTools.memberName(previous) !== memberTools.memberName(current)
            || memberTools.memberGender(previous) !== memberTools.memberGender(current)
        );

        state.members = result.members;
        editingMemberIndex = null;
        persist();
        renderAll();

        if (changed) {
            notify("Data anggota diperbarui.", "success");
        }

        focusMemberAction(index, "edit-member");
    }

    function deleteMember(index) {
        const member = state.members[index];
        if (!member) return;

        const name = memberTools.memberName(member);
        state.members = memberTools.removeMember(state.members, index);
        if (state.members.length === 0) {
            state.groupCount = 2;
        } else {
            state.groupCount = Math.min(state.groupCount, state.members.length);
        }

        editingMemberIndex = null;
        persist();
        renderAll();

        if (state.members.length > 0) {
            focusMemberAction(Math.min(index, state.members.length - 1), "edit-member");
        } else {
            dom.memberInput.focus();
        }

        notify(`${name} dihapus.`, "info", {
            duration: 7000,
            action: {
                label: "Urungkan",
                onClick: () => {
                    const key = memberTools.nameKey(member);
                    if (state.members.some((existing) => memberTools.nameKey(existing) === key)) {
                        notify("Anggota tersebut sudah ada di daftar.", "warning");
                        return;
                    }

                    const next = [...state.members];
                    next.splice(Math.min(index, next.length), 0, member);
                    state.members = next;
                    normalizeGroupCount();
                    persist();
                    renderAll();
                    notify(`${name} dikembalikan.`, "success");
                }
            }
        });
    }

    function saveGroupName(index, value) {
        const name = memberTools.normalizeName(value);
        if (!name) {
            notify("Nama kelompok tidak boleh kosong.", "error");
            const input = dom.groupsGrid.querySelector(".group-rename .inline-input");
            if (input) {
                input.classList.add("is-invalid");
                input.focus();
                input.select();
            }
            return;
        }

        state.groups = state.groups.map((group, groupIndex) => (
            groupIndex === index ? { ...group, name } : group
        ));

        const activeSession = historyTools.find(state.history, state.activeSessionId);
        if (activeSession) {
            state.history = state.history.map((session) => {
                if (session.id !== activeSession.id) return session;

                return {
                    ...session,
                    updatedAt: new Date().toISOString(),
                    groups: session.groups.map((group, groupIndex) => (
                        groupIndex === index ? { ...group, name } : group
                    ))
                };
            });
        }

        editingGroupIndex = null;
        persist();
        renderResults();
        notify("Nama kelompok diperbarui.", "success");
        focusGroupEdit(index);
    }

    function handleGroupCountInput() {
        clearGroupError();

        if (state.members.length === 0) {
            dom.distributionHint.textContent = "Tambahkan anggota terlebih dahulu.";
            return;
        }

        const raw = dom.groupCountInput.value.trim();
        if (!raw) {
            dom.distributionHint.textContent = "Isi jumlah kelompok untuk melihat pembagian.";
            return;
        }

        const result = grouping.validateGroupCount(raw, state.members.length);
        if (!result.ok) {
            dom.distributionHint.textContent = "Periksa jumlah kelompok.";
            dom.groupCountError.textContent = result.message;
            dom.groupCountError.hidden = false;
            dom.groupCountInput.classList.add("is-invalid");
            dom.groupCountInput.setAttribute("aria-invalid", "true");
            return;
        }

        state.groupCount = result.value;
        updateDistributionPreview();
        updateResultStaleness();
        persist();
    }

    function handleGroupCountBlur() {
        if (state.members.length === 0) {
            clearGroupError();
            return;
        }

        const result = grouping.validateGroupCount(dom.groupCountInput.value, state.members.length);
        if (!result.ok) {
            showGroupError(result.message, false);
            return;
        }

        const changed = state.groupCount !== result.value;
        state.groupCount = result.value;
        dom.groupCountInput.value = String(result.value);
        clearGroupError();
        updateDistributionPreview();
        updateResultStaleness();

        if (changed) persist();
    }

    function stepGroupCount(delta) {
        const parsed = /^\d+$/.test(dom.groupCountInput.value.trim())
            ? Number(dom.groupCountInput.value.trim())
            : state.groupCount;
        const max = state.members.length > 0 ? state.members.length : 2;
        const next = Math.min(Math.max(parsed + delta, 1), max);

        state.groupCount = next;
        clearGroupError();
        persist();
        renderConfig();
        updateResultStaleness();
    }

    function generateGroups(isRegenerate) {
        if (state.members.length === 0) {
            const pending = memberTools.analyze(dom.memberInput.value, state.members);
            const message = pending.newNames.length > 0
                ? "Tambahkan nama yang masih ada di kolom input ke daftar anggota terlebih dahulu."
                : "Daftar anggota masih kosong. Tambahkan minimal satu nama.";
            showMemberError(message);
            notify(message, "error");
            return;
        }

        const pending = memberTools.analyze(dom.memberInput.value, state.members);
        if (pending.newNames.length > 0) {
            const message = `Masih ada ${pending.newNames.length} nama di kolom input yang belum masuk daftar anggota. Tambahkan dulu agar nama tersebut ikut terbagi.`;
            showMemberError(message);
            notify(message, "warning");
            return;
        }

        const countResult = grouping.validateGroupCount(dom.groupCountInput.value, state.members.length);
        if (!countResult.ok) {
            showGroupError(countResult.message);
            notify(countResult.message, "error");
            return;
        }

        const groupCount = countResult.value;
        const preservedNames = state.groups.length === groupCount
            ? state.groups.map((group) => group.name)
            : null;

        let groups;
        try {
            groups = grouping.createGroups(state.members, groupCount).map((group, index) => ({
                ...group,
                name: preservedNames ? preservedNames[index] : group.name
            }));
        } catch (error) {
            notify(error.message || "Kelompok gagal dibuat.", "error");
            return;
        }

        const upsert = historyTools.upsert(state.history, state.activeSessionId, {
            members: state.members,
            groupCount,
            groups
        });

        state.groupCount = groupCount;
        state.groups = groups;
        state.history = upsert.history;
        state.activeSessionId = upsert.session.id;
        editingGroupIndex = null;
        editingMemberIndex = null;

        persist();
        renderAll();
        scrollToResults();

        notify(
            isRegenerate
                ? "Kelompok diacak ulang dan sesi diperbarui."
                : upsert.updated
                    ? "Kelompok dibuat ulang dan sesi yang sama diperbarui."
                    : "Kelompok berhasil dibuat dan ditambahkan ke riwayat.",
            "success"
        );
    }

    async function copyAllResults() {
        if (state.groups.length === 0) {
            notify("Belum ada hasil untuk disalin.", "error");
            return;
        }

        const result = await exporter.copyText(exporter.formatAll(state.groups, getExportMeta()));
        if (result.ok) {
            notify("Semua kelompok disalin ke clipboard.", "success");
        } else {
            notify("Tidak dapat menyalin. Periksa izin clipboard di browser Anda.", "error");
        }
    }

    async function copyGroup(index) {
        const group = state.groups[index];
        if (!group) {
            notify("Kelompok tidak ditemukan.", "error");
            return;
        }

        const result = await exporter.copyText(exporter.formatGroup(group));
        if (result.ok) {
            notify(`${group.name} disalin ke clipboard.`, "success");
        } else {
            notify("Tidak dapat menyalin. Periksa izin clipboard di browser Anda.", "error");
        }
    }

    function downloadResults() {
        if (state.groups.length === 0) {
            notify("Belum ada hasil untuk diunduh.", "error");
            return;
        }

        const result = exporter.downloadTxt(state.groups, getExportMeta());
        if (result.ok) {
            notify(`File ${result.filename} diunduh.`, "success");
        } else {
            notify("File TXT gagal dibuat. Coba lagi atau gunakan fitur salin.", "error");
        }
    }

    function printResults() {
        if (state.groups.length === 0) {
            notify("Belum ada hasil untuk dicetak.", "error");
            return;
        }

        const result = exporter.printResults(state.groups, getExportMeta());
        if (!result.ok) {
            notify("Jendela cetak tidak dapat dibuka.", "error");
        }
    }

    async function clearMembers() {
        if (state.members.length === 0) return;

        const confirmed = await confirmAction({
            title: "Hapus semua anggota?",
            message: "Seluruh nama di daftar anggota akan dihapus. Hasil kelompok yang sudah dibuat akan ditandai kedaluwarsa.",
            confirmLabel: "Hapus semua"
        });
        if (!confirmed) return;

        state.members = [];
        state.groupCount = 2;
        editingMemberIndex = null;
        persist();
        renderAll();
        notify("Semua anggota dihapus.", "success");
    }

    async function deleteSession(sessionId) {
        const session = historyTools.find(state.history, sessionId);
        if (!session) return;

        const isActive = session.id === state.activeSessionId;
        const confirmed = await confirmAction({
            title: "Hapus sesi ini?",
            message: isActive
                ? "Sesi ini sedang ditampilkan. Hasil kelompok tetap tersedia, tetapi sesi tidak lagi tersimpan di riwayat."
                : `${session.name} akan dihapus dari riwayat.`,
            confirmLabel: "Hapus sesi"
        });
        if (!confirmed) return;

        state.history = historyTools.remove(state.history, sessionId);
        if (isActive) state.activeSessionId = null;
        persist();
        renderAll();
        notify("Sesi riwayat dihapus.", "success");
    }

    async function clearHistory() {
        if (state.history.length === 0) return;

        const active = historyTools.find(state.history, state.activeSessionId);
        const confirmed = await confirmAction({
            title: "Hapus semua riwayat?",
            message: active
                ? "Seluruh sesi tersimpan akan dihapus. Hasil yang sedang ditampilkan tetap ada, tetapi tidak lagi tercatat di riwayat."
                : "Seluruh sesi tersimpan akan dihapus dari perangkat ini.",
            confirmLabel: "Hapus riwayat"
        });
        if (!confirmed) return;

        state.history = [];
        state.activeSessionId = null;
        persist();
        renderAll();
        notify("Semua riwayat dihapus.", "success");
    }

    function openSession(sessionId) {
        const session = historyTools.find(state.history, sessionId);
        if (!session) {
            notify("Sesi tidak ditemukan.", "error");
            return;
        }

        state.members = session.members.map((member) => memberTools.copyMember(member));
        state.groupCount = session.groupCount;
        state.groups = session.groups.map((group) => ({
            id: group.id,
            name: group.name,
            members: group.members.map((member) => memberTools.copyMember(member))
        }));
        state.activeSessionId = session.id;
        editingMemberIndex = null;
        editingGroupIndex = null;
        dom.memberInput.value = "";
        dom.memberGenderInput.value = "";
        clearMemberError();
        persist();
        renderAll();
        scrollToResults();
        notify(`${session.name} dibuka.`, "success");
    }

    async function resetSession() {
        const confirmed = await confirmAction({
            title: "Reset sesi saat ini?",
            message: "Daftar anggota, hasil kelompok, dan jumlah kelompok akan dikosongkan. Riwayat dan tema tetap disimpan.",
            confirmLabel: "Reset sesi",
            tone: "primary"
        });
        if (!confirmed) return;

        state.members = [];
        state.groups = [];
        state.groupCount = 2;
        state.activeSessionId = null;
        editingMemberIndex = null;
        editingGroupIndex = null;
        dom.memberInput.value = "";
        dom.memberGenderInput.value = "";
        clearMemberError();
        clearGroupError();
        persist();
        renderAll();
        notify("Sesi saat ini direset.", "success");
    }

    async function deleteAllData() {
        const confirmed = await confirmAction({
            title: "Hapus semua data DeTim?",
            message: "Daftar anggota, hasil, riwayat, dan preferensi tema akan dihapus dari perangkat ini. Tindakan ini tidak dapat dibatalkan.",
            confirmLabel: "Hapus semua data"
        });
        if (!confirmed) return;

        const removal = storage.remove();

        state = storage.createDefault();
        editingMemberIndex = null;
        editingGroupIndex = null;
        dom.memberInput.value = "";
        dom.memberGenderInput.value = "";
        dom.printView.replaceChildren();
        clearMemberError();
        clearGroupError();
        applyTheme("light", false);
        readWarning = null;
        lastStorageCode = null;
        storageIssue = storage.isAvailable() ? null : "unavailable";
        renderAll();

        if (removal.ok) {
            notify("Semua data DeTim dihapus dari perangkat ini.", "success");
        } else if (removal.code === "unavailable") {
            notify("Data sesi dihapus dari tampilan. Penyimpanan lokal tidak tersedia, jadi tidak ada data tersimpan yang dapat dihapus.", "warning");
        } else {
            notify("Data di perangkat tidak dapat dihapus sepenuhnya. Muat ulang halaman lalu coba lagi.", "error");
        }
    }

    function handleMembersClick(event) {
        const button = event.target.closest("[data-action]");
        if (!button || !dom.membersList.contains(button)) return;

        const index = Number(button.dataset.index);
        const action = button.dataset.action;

        if (action === "edit-member") {
            editingMemberIndex = index;
            renderMembers();
        } else if (action === "cancel-edit-member") {
            editingMemberIndex = null;
            renderMembers();
            focusMemberAction(index, "edit-member");
        } else if (action === "delete-member") {
            deleteMember(index);
        }
    }

    function handleMembersSubmit(event) {
        const form = event.target.closest("form[data-edit-member]");
        if (!form) return;
        event.preventDefault();

        const index = Number(form.dataset.editMember);
        const input = form.querySelector(".inline-input");
        const select = form.querySelector(".inline-select");
        saveMemberEdit(index, input ? input.value : "", select ? select.value : undefined);
    }

    function handleGroupsClick(event) {
        const button = event.target.closest("[data-action]");
        if (!button || !dom.groupsGrid.contains(button)) return;

        const index = Number(button.dataset.index);
        const action = button.dataset.action;

        if (action === "copy-group") {
            copyGroup(index);
        } else if (action === "edit-group") {
            editingGroupIndex = index;
            renderResults();
        } else if (action === "cancel-rename-group") {
            editingGroupIndex = null;
            renderResults();
            focusGroupEdit(index);
        }
    }

    function handleGroupsSubmit(event) {
        const form = event.target.closest("form[data-rename-group]");
        if (!form) return;
        event.preventDefault();

        const index = Number(form.dataset.renameGroup);
        const input = form.querySelector(".inline-input");
        saveGroupName(index, input ? input.value : "");
    }

    function handleInlineKeydown(event) {
        if (event.key !== "Escape") return;

        const memberForm = event.target.closest("form[data-edit-member]");
        if (memberForm) {
            event.preventDefault();
            const index = Number(memberForm.dataset.editMember);
            editingMemberIndex = null;
            renderMembers();
            focusMemberAction(index, "edit-member");
            return;
        }

        const groupForm = event.target.closest("form[data-rename-group]");
        if (groupForm) {
            event.preventDefault();
            const index = Number(groupForm.dataset.renameGroup);
            editingGroupIndex = null;
            renderResults();
            focusGroupEdit(index);
        }
    }

    function handleHistoryClick(event) {
        const button = event.target.closest("[data-action]");
        if (!button || !dom.historyList.contains(button)) return;

        const sessionId = button.dataset.sessionId;
        if (button.dataset.action === "open-session") {
            openSession(sessionId);
        } else if (button.dataset.action === "delete-session") {
            deleteSession(sessionId);
        }
    }

    function bindEvents() {
        dom.memberForm.addEventListener("submit", (event) => {
            event.preventDefault();
            addMembersFromInput();
        });

        dom.memberInput.addEventListener("input", () => {
            clearMemberError();
            updateInputPreview();
        });

        dom.clearInputBtn.addEventListener("click", () => {
            dom.memberInput.value = "";
            clearMemberError();
            updateInputPreview();
            dom.memberInput.focus();
        });

        dom.configForm.addEventListener("submit", (event) => {
            event.preventDefault();
            generateGroups(false);
        });

        dom.groupCountInput.addEventListener("input", handleGroupCountInput);
        dom.groupCountInput.addEventListener("blur", handleGroupCountBlur);
        dom.decreaseGroups.addEventListener("click", () => stepGroupCount(-1));
        dom.increaseGroups.addEventListener("click", () => stepGroupCount(1));

        dom.membersList.addEventListener("click", handleMembersClick);
        dom.membersList.addEventListener("submit", handleMembersSubmit);
        dom.membersList.addEventListener("keydown", handleInlineKeydown);
        dom.clearMembersBtn.addEventListener("click", clearMembers);

        dom.groupsGrid.addEventListener("click", handleGroupsClick);
        dom.groupsGrid.addEventListener("submit", handleGroupsSubmit);
        dom.groupsGrid.addEventListener("keydown", handleInlineKeydown);

        dom.regenerateBtn.addEventListener("click", () => generateGroups(true));
        dom.copyAllBtn.addEventListener("click", copyAllResults);
        dom.downloadBtn.addEventListener("click", downloadResults);
        dom.printBtn.addEventListener("click", printResults);
        dom.refreshStaleBtn.addEventListener("click", () => generateGroups(true));

        dom.historyList.addEventListener("click", handleHistoryClick);
        dom.clearHistoryBtn.addEventListener("click", clearHistory);

        dom.resetSessionBtn.addEventListener("click", resetSession);
        dom.deleteAllBtn.addEventListener("click", deleteAllData);
    }

    function init() {
        const restored = storage.read();

        if (restored.status === "unavailable") {
            storageIssue = "unavailable";
        } else if (restored.status === "invalid") {
            readWarning = "Data tersimpan tidak dapat dibaca sehingga DeTim dimulai dari data kosong. Data lama akan diganti setelah Anda menyimpan perubahan.";
        }

        state = restored.data;
        normalizeGroupCount();
        applyTheme(state.settings.theme);
        bindEvents();
        renderAll();
    }

    init();
})();
