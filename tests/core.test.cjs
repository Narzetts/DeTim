const assert = require("assert");

const store = new Map();
global.window = {
    crypto: globalThis.crypto,
    localStorage: {
        getItem(key) {
            return store.has(key) ? store.get(key) : null;
        },
        setItem(key, value) {
            store.set(key, String(value));
        },
        removeItem(key) {
            store.delete(key);
        }
    }
};

require("../js/storage.js");
require("../js/grouping.js");
require("../js/members.js");
require("../js/history.js");

const { storage, grouping, members, history } = window.DeTim;

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        passed += 1;
        console.log(`PASS ${name}`);
    } catch (error) {
        failed += 1;
        console.log(`FAIL ${name}\n     ${error.message}`);
    }
}

function shuffledKey(list) {
    return list.join("|");
}

console.log("grouping");

test("shuffleArray keeps every item and does not mutate the input", () => {
    const input = ["a", "b", "c", "d", "e"];
    for (let run = 0; run < 200; run += 1) {
        const output = grouping.shuffleArray(input);
        assert.deepStrictEqual(input, ["a", "b", "c", "d", "e"]);
        assert.strictEqual(output.length, input.length);
        assert.deepStrictEqual([...output].sort(), [...input].sort());
    }
});

test("shuffleArray reaches all 24 permutations of four items", () => {
    const seen = new Set();
    for (let run = 0; run < 5000; run += 1) {
        seen.add(shuffledKey(grouping.shuffleArray(["a", "b", "c", "d"])));
    }
    assert.strictEqual(seen.size, 24);
});

test("createGroups covers every member exactly once for many sizes", () => {
    for (let memberCount = 1; memberCount <= 60; memberCount += 1) {
        const roster = Array.from({ length: memberCount }, (_, index) => `Anggota ${index + 1}`);
        for (let groupCount = 1; groupCount <= memberCount; groupCount += 1) {
            const groups = grouping.createGroups(roster, groupCount);
            const flat = groups.flatMap((group) => group.members);

            assert.strictEqual(groups.length, groupCount);
            assert.strictEqual(flat.length, memberCount);
            assert.strictEqual(new Set(flat).size, memberCount);
            assert.deepStrictEqual([...flat].sort(), [...roster].sort());

            const sizes = groups.map((group) => group.members.length);
            assert.ok(Math.max(...sizes) - Math.min(...sizes) <= 1);
            groups.forEach((group, index) => {
                assert.strictEqual(group.id, `group-${index + 1}`);
                assert.strictEqual(group.name, `Kelompok ${index + 1}`);
            });
        }
    }
});

test("createGroups balances genders across groups while keeping sizes balanced", () => {
    const roster = [
        ...Array.from({ length: 6 }, (_, index) => ({ name: `Laki ${index}`, gender: "male" })),
        ...Array.from({ length: 3 }, (_, index) => ({ name: `Perempuan ${index}`, gender: "female" })),
        ...Array.from({ length: 2 }, (_, index) => ({ name: `Belum ${index}`, gender: "" }))
    ];

    for (let run = 0; run < 80; run += 1) {
        const groups = grouping.createGroups(roster, 3);
        const sizes = groups.map((group) => group.members.length).sort();
        assert.deepStrictEqual(sizes, [3, 4, 4]);

        const maleCounts = groups.map((group) => (
            group.members.filter((member) => member.gender === "male").length
        ));
        const femaleCounts = groups.map((group) => (
            group.members.filter((member) => member.gender === "female").length
        ));

        assert.ok(Math.max(...maleCounts) - Math.min(...maleCounts) <= 1);
        assert.ok(Math.max(...femaleCounts) - Math.min(...femaleCounts) <= 1);

        const flat = groups.flatMap((group) => group.members.map((member) => member.name));
        assert.deepStrictEqual([...flat].sort(), roster.map((member) => member.name).sort());
    }
});

test("createGroups rejects invalid rosters and counts", () => {
    assert.throws(() => grouping.createGroups([], 1), /kosong/);
    assert.throws(() => grouping.createGroups(["A"], 0), /tidak valid/);
    assert.throws(() => grouping.createGroups(["A"], 2), /tidak valid/);
    assert.throws(() => grouping.createGroups(["A", "B"], 1.5), /tidak valid/);
    assert.throws(() => grouping.createGroups(["A", "B"], "1"), /tidak valid/);
    assert.throws(() => grouping.createGroups(["A", "a"], 1), /ganda/);
});

test("validateGroupCount covers every rejection case", () => {
    assert.match(grouping.validateGroupCount("1", 0).message, /masih kosong/);
    assert.match(grouping.validateGroupCount("", 4).message, /tidak boleh kosong/);
    assert.match(grouping.validateGroupCount("  ", 4).message, /tidak boleh kosong/);
    assert.match(grouping.validateGroupCount("abc", 4).message, /angka bulat/);
    assert.match(grouping.validateGroupCount("2.5", 4).message, /angka bulat/);
    assert.match(grouping.validateGroupCount("0", 4).message, /minimal 1/);
    assert.match(grouping.validateGroupCount("-2", 4).message, /minimal 1/);
    assert.match(grouping.validateGroupCount("5", 4).message, /melebihi jumlah anggota \(4\)/);
    assert.match(grouping.validateGroupCount("9007199254740993", 4).message, /tidak valid/);

    assert.deepStrictEqual(grouping.validateGroupCount(" 3 ", 4), { ok: true, value: 3, message: "" });
    assert.deepStrictEqual(grouping.validateGroupCount("1", 1), { ok: true, value: 1, message: "" });
    assert.deepStrictEqual(grouping.validateGroupCount("4", 4), { ok: true, value: 4, message: "" });
});

test("describeDistribution reports the single size or the split", () => {
    assert.deepStrictEqual(grouping.describeDistribution(6, 3), { min: 2, max: 2, largeGroups: 0, smallGroups: 3 });
    assert.deepStrictEqual(grouping.describeDistribution(7, 3), { min: 2, max: 3, largeGroups: 1, smallGroups: 2 });
    assert.deepStrictEqual(grouping.describeDistribution(1, 1), { min: 1, max: 1, largeGroups: 0, smallGroups: 1 });
    assert.strictEqual(grouping.describeDistribution(3, 4), null);
    assert.strictEqual(grouping.describeDistribution(0, 1), null);
    assert.strictEqual(grouping.describeDistribution(3, 1.5), null);
});

console.log("\nmembers");

test("analyze trims, ignores blanks, and detects duplicates", () => {
    const result = members.analyze("  Andi   Saputra \nandi saputra\n\nBudi Santoso\nBUDI SANTOSO\nSiti Rahma ", ["Siti Rahma"]);
    assert.strictEqual(result.detected, 5);
    assert.deepStrictEqual(result.newNames, ["Andi Saputra", "Budi Santoso"]);
    assert.strictEqual(result.duplicates.length, 3);
    assert.deepStrictEqual(result.duplicates.map((entry) => entry.name), ["andi saputra", "BUDI SANTOSO", "Siti Rahma"]);
    assert.deepStrictEqual(result.duplicates.map((entry) => entry.reason), ["input", "input", "existing"]);
});

test("addMembers appends only new names with the batch gender", () => {
    const result = members.addMembers(
        [{ name: "Andi", gender: "male" }],
        "Andi\nBudi\nBudi\nCitra",
        "female"
    );

    assert.deepStrictEqual(result.members, [
        { name: "Andi", gender: "male" },
        { name: "Budi", gender: "female" },
        { name: "Citra", gender: "female" }
    ]);
    assert.strictEqual(result.newNames.length, 2);
    assert.strictEqual(result.duplicates.length, 2);
});

test("renameMember validates index, emptiness, duplicates, and updates gender", () => {
    const roster = [
        { name: "Andi", gender: "male" },
        { name: "Budi", gender: "female" }
    ];

    assert.match(members.renameMember(roster, 4, "Citra").message, /tidak ditemukan/);
    assert.match(members.renameMember(roster, 0, "   ").message, /tidak boleh kosong/);
    assert.match(members.renameMember(roster, 0, " budi ").message, /sudah ada/);

    const result = members.renameMember(roster, 0, "  Andi   Pratama ", "female");
    assert.strictEqual(result.ok, true);
    assert.deepStrictEqual(result.members, [
        { name: "Andi Pratama", gender: "female" },
        { name: "Budi", gender: "female" }
    ]);

    const preserved = members.renameMember(roster, 1, "Budi Santoso");
    assert.strictEqual(preserved.members[1].gender, "female");

    const cleared = members.renameMember(roster, 0, "Andi", "");
    assert.strictEqual(cleared.members[0].gender, "");
});

test("removeMember removes the exact index only", () => {
    assert.deepStrictEqual(members.removeMember(["A", "B", "C"], 1), ["A", "C"]);
    assert.deepStrictEqual(members.removeMember(["A", "B"], 9), ["A", "B"]);

    const roster = [
        { name: "A", gender: "male" },
        { name: "B", gender: "female" }
    ];
    assert.deepStrictEqual(members.removeMember(roster, 0), [roster[1]]);
});

console.log("\nhistory");

test("createSession stores the full session shape", () => {
    const groups = grouping.createGroups(["A", "B", "C"], 2);
    const session = history.createSession(["A", "B", "C"], 2, groups, new Date("2026-11-17T10:30:00+07:00"));
    assert.match(session.id, /^session-/);
    assert.strictEqual(session.createdAt, "2026-11-17T03:30:00.000Z");
    assert.match(session.name, /^Sesi /);
    assert.deepStrictEqual(session.members, [
        { name: "A", gender: "" },
        { name: "B", gender: "" },
        { name: "C", gender: "" }
    ]);
    assert.strictEqual(session.groupCount, 2);
    assert.strictEqual(session.groups.length, 2);
    assert.notStrictEqual(session.groups, groups);
});

test("sameRoster compares names case-insensitively and checks group count and gender", () => {
    const session = { members: ["Andi", "Budi"], groupCount: 2 };
    assert.strictEqual(history.sameRoster(session, ["andi", "BUDI"], 2), true);
    assert.strictEqual(history.sameRoster(session, ["Andi", "Budi"], 1), false);
    assert.strictEqual(history.sameRoster(session, ["Andi"], 2), false);
    assert.strictEqual(history.sameRoster(null, ["Andi"], 1), false);

    const gendered = {
        members: [{ name: "Andi", gender: "male" }],
        groupCount: 1
    };
    assert.strictEqual(history.sameRoster(gendered, [{ name: "andi", gender: "male" }], 1), true);
    assert.strictEqual(history.sameRoster(gendered, [{ name: "Andi", gender: "female" }], 1), false);
    assert.strictEqual(history.sameRoster(gendered, [{ name: "Andi", gender: "" }], 1), false);
});

test("upsert updates the active session when roster and count match", () => {
    const first = history.createSession(["A", "B"], 2, grouping.createGroups(["A", "B"], 2));
    const state = { history: [first], activeSessionId: first.id };
    const nextGroups = grouping.createGroups(["A", "B"], 2);
    const result = history.upsert(state.history, state.activeSessionId, {
        members: ["A", "B"],
        groupCount: 2,
        groups: nextGroups
    });

    assert.strictEqual(result.updated, true);
    assert.strictEqual(result.history.length, 1);
    assert.strictEqual(result.session.id, first.id);
    assert.notStrictEqual(result.session.groups, first.groups);
    assert.deepStrictEqual(result.history[0].members, [
        { name: "A", gender: "" },
        { name: "B", gender: "" }
    ]);
});

test("upsert adds a new session when the roster or count changes", () => {
    const first = history.createSession(["A", "B"], 2, grouping.createGroups(["A", "B"], 2));
    const result = history.upsert([first], first.id, {
        members: ["A", "B", "C"],
        groupCount: 3,
        groups: grouping.createGroups(["A", "B", "C"], 3)
    });

    assert.strictEqual(result.updated, false);
    assert.strictEqual(result.history.length, 2);
    assert.notStrictEqual(result.session.id, first.id);
    assert.strictEqual(result.history[0].id, result.session.id);
});

test("upsert never exceeds the 20 session cap", () => {
    let sessions = [];
    let activeId = null;
    for (let index = 0; index < 25; index += 1) {
        const roster = [`Anggota ${index}`];
        const result = history.upsert(sessions, activeId, {
            members: roster,
            groupCount: 1,
            groups: grouping.createGroups(roster, 1)
        });
        sessions = result.history;
        activeId = result.session.id;
    }

    assert.strictEqual(sessions.length, 20);
    assert.strictEqual(sessions[0].members[0].name, "Anggota 24");
});

test("find and remove work by session id", () => {
    const first = history.createSession(["A"], 1, grouping.createGroups(["A"], 1));
    const second = history.createSession(["B"], 1, grouping.createGroups(["B"], 1));
    const sessions = [first, second];

    assert.strictEqual(history.find(sessions, second.id), second);
    assert.strictEqual(history.find(sessions, "missing"), null);
    assert.deepStrictEqual(history.remove(sessions, first.id), [second]);
    assert.deepStrictEqual(history.remove(sessions, "missing"), sessions);
});

console.log("\nstorage");

function validSession(name) {
    const roster = [name];
    return history.createSession(roster, 1, grouping.createGroups(roster, 1));
}

test("read reports empty storage and starts clean", () => {
    store.clear();
    const result = storage.read();
    assert.strictEqual(result.status, "empty");
    assert.strictEqual(result.data.members.length, 0);
    assert.strictEqual(result.data.settings.theme, "light");
    assert.strictEqual(result.data.version, 2);
});

test("write persists validated data and read restores it", () => {
    const groups = grouping.createGroups(["Andi", "Budi", "Citra"], 2);
    const session = history.createSession(["Andi", "Budi", "Citra"], 2, groups);
    const payload = {
        ...storage.createDefault(),
        members: ["Andi", "Budi", "Citra"],
        groupCount: 2,
        groups,
        history: [session],
        activeSessionId: session.id,
        settings: { theme: "dark" }
    };

    const saved = storage.write(payload);
    assert.strictEqual(saved.ok, true);

    const restored = storage.read();
    assert.strictEqual(restored.status, "ok");
    assert.deepStrictEqual(restored.data.members, [
        { name: "Andi", gender: "" },
        { name: "Budi", gender: "" },
        { name: "Citra", gender: "" }
    ]);
    assert.strictEqual(restored.data.settings.theme, "dark");
    assert.strictEqual(restored.data.history.length, 1);
    assert.strictEqual(restored.data.activeSessionId, session.id);
});

test("update mutates stored data and remove clears it", () => {
    store.clear();
    storage.write({ ...storage.createDefault(), members: ["Andi"] });
    const updated = storage.update((data) => {
        data.settings.theme = "dark";
        return data;
    });

    assert.strictEqual(updated.ok, true);
    assert.strictEqual(storage.read().data.settings.theme, "dark");
    assert.strictEqual(storage.remove().ok, true);
    assert.strictEqual(storage.read().status, "empty");
});

test("broken JSON and wrong versions are reported as invalid", () => {
    store.set(storage.KEY, "{broken json");
    assert.strictEqual(storage.read().status, "invalid");

    store.set(storage.KEY, JSON.stringify({ version: 3 }));
    assert.strictEqual(storage.read().status, "invalid");

    store.set(storage.KEY, JSON.stringify(null));
    assert.strictEqual(storage.read().status, "invalid");
});

test("validate normalizes members, groups, counts, history, and theme", () => {
    const sessions = Array.from({ length: 25 }, (_, index) => validSession(`Sesi ${index}`));
    const data = storage.validate({
        version: 1,
        members: ["  Andi  ", "andi", "Budi", "", 42],
        groupCount: 99,
        groups: [
            { id: "g1", name: "  Tim Satu ", members: ["Andi", "Andi", "Budi"] },
            { id: "g2", name: "", members: [] },
            { id: "g3", name: "", members: ["Budi"] },
            "not a group"
        ],
        history: sessions,
        activeSessionId: sessions[0].id,
        settings: { theme: "neon" },
        updatedAt: "not a date"
    });

    assert.deepStrictEqual(data.members, [
        { name: "Andi", gender: "" },
        { name: "Budi", gender: "" }
    ]);
    assert.strictEqual(data.groupCount, 2);
    assert.deepStrictEqual(data.groups, [
        {
            id: "g1",
            name: "Tim Satu",
            members: [
                { name: "Andi", gender: "" },
                { name: "Budi", gender: "" }
            ]
        },
        {
            id: "g3",
            name: "Kelompok 3",
            members: [{ name: "Budi", gender: "" }]
        }
    ]);
    assert.strictEqual(data.history.length, 20);
    assert.strictEqual(data.activeSessionId, sessions[0].id);
    assert.strictEqual(data.settings.theme, "light");
    assert.ok(!Number.isNaN(Date.parse(data.updatedAt)));
});

test("validate migrates version 1 string members and keeps stored genders", () => {
    const data = storage.validate({
        version: 1,
        members: ["Andi", { name: "Budi", gender: "female" }, { name: "Citra", gender: "unknown" }],
        groupCount: 2,
        groups: [
            { id: "g1", name: "Tim Satu", members: ["Andi", { name: "Budi", gender: "female" }] }
        ],
        history: [],
        activeSessionId: null,
        settings: { theme: "dark" }
    });

    assert.strictEqual(data.version, 2);
    assert.deepStrictEqual(data.members, [
        { name: "Andi", gender: "" },
        { name: "Budi", gender: "female" },
        { name: "Citra", gender: "" }
    ]);
    assert.deepStrictEqual(data.groups[0].members, [
        { name: "Andi", gender: "" },
        { name: "Budi", gender: "female" }
    ]);
    assert.strictEqual(data.settings.theme, "dark");
});

test("validate drops an active id that is not in history", () => {
    const session = validSession("Andi");
    const data = storage.validate({
        version: 1,
        members: ["Andi"],
        history: [session],
        activeSessionId: "missing"
    });
    assert.strictEqual(data.activeSessionId, null);
});

test("quota errors are reported without losing in-memory state", () => {
    store.clear();
    const original = window.localStorage.setItem;
    window.localStorage.setItem = () => {
        throw new DOMException("Quota exceeded", "QuotaExceededError");
    };

    const result = storage.write({ ...storage.createDefault(), members: ["Andi"] });
    window.localStorage.setItem = original;

    assert.deepStrictEqual(result, { ok: false, code: "quota" });
    assert.strictEqual(store.get(storage.KEY), undefined);
});

test("unavailable storage is reported and reads fall back to defaults", () => {
    const originalGet = window.localStorage.getItem;
    const originalSet = window.localStorage.setItem;
    window.localStorage.getItem = () => {
        throw new DOMException("Denied", "SecurityError");
    };
    window.localStorage.setItem = () => {
        throw new DOMException("Denied", "SecurityError");
    };

    const result = storage.read();
    window.localStorage.getItem = originalGet;
    window.localStorage.setItem = originalSet;

    assert.strictEqual(result.status, "unavailable");
    assert.strictEqual(result.data.members.length, 0);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
