(function () {
    "use strict";

    const GENDERS = ["male", "female", ""];

    function normalizeName(value) {
        if (typeof value === "string") {
            return value.replace(/\s+/g, " ").trim();
        }

        if (value && typeof value === "object" && typeof value.name === "string") {
            return value.name.replace(/\s+/g, " ").trim();
        }

        return "";
    }

    function normalizeGender(value) {
        return value === "male" || value === "female" ? value : "";
    }

    function memberName(member) {
        return normalizeName(member);
    }

    function memberGender(member) {
        return member && typeof member === "object" ? normalizeGender(member.gender) : "";
    }

    function copyMember(member) {
        return {
            name: memberName(member),
            gender: memberGender(member)
        };
    }

    function genderLabel(value) {
        const gender = normalizeGender(value);
        if (gender === "male") return "Laki-laki";
        if (gender === "female") return "Perempuan";
        return "Belum diisi";
    }

    function nameKey(member) {
        return memberName(member).toLowerCase();
    }

    function analyze(text, existingMembers) {
        const existing = Array.isArray(existingMembers) ? existingMembers : [];
        const existingKeys = new Set(existing.map(nameKey));
        const seen = new Set(existingKeys);
        const newNames = [];
        const duplicates = [];
        let detected = 0;

        String(text == null ? "" : text).split(/\r?\n/).forEach((line) => {
            const name = normalizeName(line);
            if (!name) return;

            detected += 1;
            const key = nameKey(name);

            if (seen.has(key)) {
                duplicates.push({
                    name,
                    reason: existingKeys.has(key) ? "existing" : "input"
                });
                return;
            }

            seen.add(key);
            newNames.push(name);
        });

        return { detected, newNames, duplicates };
    }

    function addMembers(existingMembers, text, gender) {
        const existing = Array.isArray(existingMembers) ? existingMembers : [];
        const analysis = analyze(text, existing);
        const value = normalizeGender(gender);

        return {
            ...analysis,
            members: [
                ...existing,
                ...analysis.newNames.map((name) => ({ name, gender: value }))
            ]
        };
    }

    function renameMember(members, index, nextName, nextGender) {
        if (!Array.isArray(members) || index < 0 || index >= members.length) {
            return { ok: false, members, message: "Anggota tidak ditemukan." };
        }

        const name = normalizeName(nextName);
        if (!name) {
            return { ok: false, members, message: "Nama anggota tidak boleh kosong." };
        }

        const key = nameKey(name);
        const duplicate = members.some((member, memberIndex) => (
            memberIndex !== index && nameKey(member) === key
        ));

        if (duplicate) {
            return { ok: false, members, message: "Nama tersebut sudah ada di daftar." };
        }

        const gender = nextGender === undefined
            ? memberGender(members[index])
            : normalizeGender(nextGender);

        const next = [...members];
        next[index] = { name, gender };
        return { ok: true, members: next, message: "" };
    }

    function removeMember(members, index) {
        if (!Array.isArray(members) || index < 0 || index >= members.length) return members;
        return members.filter((member, memberIndex) => memberIndex !== index);
    }

    const app = window.DeTim = window.DeTim || {};

    app.members = {
        GENDERS,
        normalizeName,
        normalizeGender,
        memberName,
        memberGender,
        copyMember,
        genderLabel,
        nameKey,
        analyze,
        addMembers,
        renameMember,
        removeMember
    };
})();
