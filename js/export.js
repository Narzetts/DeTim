(function () {
    "use strict";

    function localDateStamp(date) {
        const value = date instanceof Date ? date : new Date();
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, "0");
        const day = String(value.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function buildFilename(date) {
        return `DeTim-Hasil-Kelompok-${localDateStamp(date)}.txt`;
    }

    function metaLine(meta) {
        return `${meta.memberCount} anggota, ${meta.groupCount} kelompok`;
    }

    function memberText(member) {
        const name = typeof member === "string" ? member : member && member.name;
        const gender = member && typeof member === "object" ? member.gender : "";
        const label = gender === "male" ? "Laki-laki" : gender === "female" ? "Perempuan" : "";
        return label ? `${name} (${label})` : String(name == null ? "" : name);
    }

    function staleNote(stale) {
        return stale
            ? "Catatan: daftar anggota berubah setelah hasil ini dibuat. Susunan di bawah adalah hasil sebelumnya."
            : "";
    }

    function formatAll(groups, meta) {
        const lines = [
            "DeTim | Hasil Kelompok",
            `Sesi: ${meta.sessionName}`,
            `Tanggal: ${window.DeTim.history.formatLongDate(meta.createdAt)}, ${window.DeTim.history.formatTime(meta.createdAt)}`,
            metaLine(meta)
        ];

        const note = staleNote(meta.stale);
        if (note) lines.push("", note);

        groups.forEach((group, groupIndex) => {
            lines.push("", `${groupIndex + 1}. ${group.name} (${group.members.length} anggota)`);
            group.members.forEach((member, memberIndex) => {
                lines.push(`${memberIndex + 1}. ${memberText(member)}`);
            });
        });

        return `${lines.join("\n")}\n`;
    }

    function formatGroup(group) {
        const lines = [`${group.name} (${group.members.length} anggota)`];
        group.members.forEach((member, index) => {
            lines.push(`${index + 1}. ${memberText(member)}`);
        });
        return `${lines.join("\n")}\n`;
    }

    function fallbackCopy(text) {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.top = "-1000px";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();

        let copied = false;
        try {
            copied = document.execCommand("copy");
        } catch (error) {
            copied = false;
        }

        area.remove();
        return copied;
    }

    async function copyText(text) {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
            try {
                await navigator.clipboard.writeText(text);
                return { ok: true, method: "clipboard" };
            } catch (error) {
                // Permission can be denied; the selection fallback is attempted below.
            }
        }

        if (fallbackCopy(text)) {
            return { ok: true, method: "fallback" };
        }

        return { ok: false, code: "copy" };
    }

    function downloadTxt(groups, meta) {
        let url = null;

        try {
            const content = formatAll(groups, meta);
            const filename = buildFilename(new Date());
            const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
            url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            link.style.display = "none";
            document.body.appendChild(link);
            link.click();
            link.remove();

            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
            return { ok: true, filename };
        } catch (error) {
            if (url) URL.revokeObjectURL(url);
            return { ok: false, code: "download" };
        }
    }

    function createElement(tag, className, text) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text != null) element.textContent = text;
        return element;
    }

    function renderPrint(groups, meta) {
        const sheet = document.getElementById("printView");
        if (!sheet) return false;

        sheet.replaceChildren();

        const header = createElement("header", "print-sheet__header");
        header.appendChild(createElement("p", "print-sheet__brand", "DeTim"));
        header.appendChild(createElement("h1", "print-sheet__title", "Hasil Kelompok"));
        header.appendChild(createElement(
            "p",
            "print-sheet__meta",
            `${meta.sessionName} · ${meta.memberCount} anggota · ${meta.groupCount} kelompok`
        ));
        const date = window.DeTim.history.formatLongDate(meta.createdAt);
        const time = window.DeTim.history.formatTime(meta.createdAt);
        header.appendChild(createElement("p", "print-sheet__date", `${date}, ${time}`));

        if (meta.stale) {
            header.appendChild(createElement(
                "p",
                "print-sheet__note",
                "Hasil ini dibuat sebelum daftar anggota diubah. Susunan di bawah adalah hasil sebelumnya."
            ));
        }

        sheet.appendChild(header);

        const list = createElement("div", "print-sheet__groups");
        groups.forEach((group) => {
            const section = createElement("section", "print-sheet__group");
            section.appendChild(createElement("h2", "", group.name));
            section.appendChild(createElement("p", "print-sheet__count", `${group.members.length} anggota`));

            const members = document.createElement("ol");
            group.members.forEach((member) => {
                const item = document.createElement("li");
                item.textContent = memberText(member);
                members.appendChild(item);
            });

            section.appendChild(members);
            list.appendChild(section);
        });
        sheet.appendChild(list);

        const footer = createElement("footer", "print-sheet__footer");
        footer.textContent = `Dicetak ${window.DeTim.history.formatLongDate(new Date())} dari DeTim V1.0`;
        sheet.appendChild(footer);

        return true;
    }

    function printResults(groups, meta) {
        if (!groups.length || !renderPrint(groups, meta)) {
            return { ok: false, code: "print" };
        }

        const previousTitle = document.title;
        const nextTitle = `DeTim-Hasil-Kelompok-${localDateStamp(new Date())}`;
        document.title = nextTitle;

        let restored = false;
        const restore = () => {
            if (restored) return;
            restored = true;
            document.title = previousTitle;
            window.removeEventListener("afterprint", restore);
        };

        window.addEventListener("afterprint", restore);
        window.setTimeout(restore, 5000);

        try {
            window.print();
            return { ok: true };
        } catch (error) {
            restore();
            return { ok: false, code: "print" };
        }
    }

    const app = window.DeTim = window.DeTim || {};

    app.exporter = {
        buildFilename,
        formatAll,
        formatGroup,
        copyText,
        downloadTxt,
        printResults
    };
})();
