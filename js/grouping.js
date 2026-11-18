(function () {
    "use strict";

    function shuffleArray(array) {
        const result = [...array];

        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }

        return result;
    }

    function memberName(member) {
        if (typeof member === "string") return member;
        return member && typeof member.name === "string" ? member.name : "";
    }

    function memberGender(member) {
        if (!member || typeof member !== "object") return "";
        return member.gender === "male" || member.gender === "female" ? member.gender : "";
    }

    function chooseGroup(groups, sizes, gender) {
        let bestGenderCount = Infinity;
        let bestTotal = Infinity;
        let candidates = [];

        groups.forEach((group, index) => {
            if (group.members.length >= sizes[index]) return;

            const genderCount = group.members.reduce((total, member) => (
                total + (memberGender(member) === gender ? 1 : 0)
            ), 0);
            const total = group.members.length;

            if (genderCount < bestGenderCount || (genderCount === bestGenderCount && total < bestTotal)) {
                bestGenderCount = genderCount;
                bestTotal = total;
                candidates = [index];
            } else if (genderCount === bestGenderCount && total === bestTotal) {
                candidates.push(index);
            }
        });

        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    function createGroups(members, groupCount) {
        if (!Array.isArray(members) || members.length === 0) {
            throw new Error("Daftar anggota masih kosong.");
        }

        if (!Number.isInteger(groupCount) || groupCount < 1 || groupCount > members.length) {
            throw new Error("Jumlah kelompok tidak valid.");
        }

        const uniqueNames = new Set(members.map((member) => memberName(member).toLowerCase()));
        if (uniqueNames.size !== members.length) {
            throw new Error("Daftar anggota mengandung nama ganda.");
        }

        const shuffled = shuffleArray(members);
        const baseSize = Math.floor(members.length / groupCount);
        const extra = members.length % groupCount;
        const sizes = Array.from({ length: groupCount }, (_, index) => baseSize + (index < extra ? 1 : 0));
        const groups = Array.from({ length: groupCount }, (_, index) => ({
            id: `group-${index + 1}`,
            name: `Kelompok ${index + 1}`,
            members: []
        }));

        const buckets = { male: [], female: [], "": [] };
        shuffled.forEach((member) => {
            buckets[memberGender(member)].push(member);
        });

        ["male", "female", ""].forEach((gender) => {
            buckets[gender].forEach((member) => {
                const index = chooseGroup(groups, sizes, gender);
                groups[index].members.push(member);
            });
        });

        return groups;
    }

    function validateGroupCount(value, memberCount) {
        const text = String(value == null ? "" : value).trim();

        if (memberCount < 1) {
            return {
                ok: false,
                value: null,
                message: "Daftar anggota masih kosong. Tambahkan minimal satu nama."
            };
        }

        if (!text) {
            return {
                ok: false,
                value: null,
                message: "Jumlah kelompok tidak boleh kosong."
            };
        }

        if (!/^\d+$/.test(text)) {
            const message = /^-/.test(text)
                ? "Jumlah kelompok minimal 1."
                : "Jumlah kelompok harus berupa angka bulat.";
            return {
                ok: false,
                value: null,
                message
            };
        }

        const count = Number(text);
        if (!Number.isSafeInteger(count)) {
            return {
                ok: false,
                value: null,
                message: "Jumlah kelompok tidak valid."
            };
        }

        if (count < 1) {
            return {
                ok: false,
                value: count,
                message: "Jumlah kelompok minimal 1."
            };
        }

        if (count > memberCount) {
            return {
                ok: false,
                value: count,
                message: `Jumlah kelompok tidak boleh melebihi jumlah anggota (${memberCount}).`
            };
        }

        return { ok: true, value: count, message: "" };
    }

    function describeDistribution(memberCount, groupCount) {
        if (!Number.isInteger(memberCount) || !Number.isInteger(groupCount)) return null;
        if (memberCount < 1 || groupCount < 1 || groupCount > memberCount) return null;

        const min = Math.floor(memberCount / groupCount);
        const max = Math.ceil(memberCount / groupCount);
        const largeGroups = memberCount % groupCount;

        return { min, max, largeGroups, smallGroups: groupCount - largeGroups };
    }

    const app = window.DeTim = window.DeTim || {};

    app.grouping = {
        shuffleArray,
        createGroups,
        validateGroupCount,
        describeDistribution
    };
})();
