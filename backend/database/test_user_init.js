const schema = require("./schema");

async function initTestUsers() {
    const existingUsers = await schema.users.find();
    console.log(`Users in DB: ${existingUsers}`);
    if(!existingUsers) {
        console.log("Users not found (likely a fresh install); creating test users");
        const admin = new schema.users({
            email: "admin@nosql7.com",
            password: "admin",
            role: "admin",
            history: []
        });
        const pupil = new schema.users({
            email: "john.doe@example.com",
            password: "password",
            firstName: "John",
            lastName: "Doe",
            role: "pupil",
            tasks: [],
            history: []
        });
        const teacher = new schema.users({
            email: "jane.doe@example.com",
            password: "password",
            firstName: "Jane",
            lastName: "Doe",
            role: "teacher",
            tasks: [],
            history: []
        });
        await Promise.all([admin.save(), pupil.save(), teacher.save()]);
        return;
    }
    console.log("Some users are present in the DB. Skipping test users step.",
        "If you want to set up test users anyway, perform a POST request on",
        "http://localhost:8000/clear-db and restart the app.");
}

module.exports = initTestUsers;