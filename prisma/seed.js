const { v4: uuidv4 } = require("uuid");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//clear and seed db
seed();

async function seed() {
  await clearDabatase();
  await createUsersWithBudgets();
  await createCategories();
  await createExpenses();
}

async function clearDabatase() {
  await prisma.$transaction([
    prisma.expense.deleteMany({}),
    prisma.category.deleteMany({}),
    prisma.budget.deleteMany({}),
    prisma.user.deleteMany({}),
  ]);
}

async function createUsersWithBudgets() {
  //create testusers with 'banaan' password
  const createUser1 = prisma.user.create({
    data: {
      id: "70e0cff2-7589-4de8-9f2f-4e372a5a15f3",
      username: "matt123",
      passwordHash:
        "$2a$10$Od4oIfW1IZyyQUvc.X96EOhCGNcG.XAm49fA/CA5F43znmgO2dCIe",
      firstName: "Matt",
      lastName: "Bremm",
      Budget: {
        createMany: {
          data: [
            {
              id: uuidv4(),
              amount: 2000,
              startDate: new Date("2022-10-01"),
              endDate: new Date("2023-03-01"),
            },
            {
              id: uuidv4(),
              amount: 999.99,
              startDate: new Date("2023-03-01"),
            },
          ],
        },
      },
    },
  });

  const createUser2 = prisma.user.create({
    data: {
      id: "c97df944-505b-4508-8528-1de8da028fc7",
      username: "johndoe",
      passwordHash:
        "$2a$10$Od4oIfW1IZyyQUvc.X96EOhCGNcG.XAm49fA/CA5F43znmgO2dCIe",
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@gmail.com",
    },
  });

  await prisma.$transaction([createUser1, createUser2]);
}

async function createCategories() {
  await prisma.category.createMany({
    data: [
      {
        name: "housing",
        color: "#87CEEB",
        id: "a3f09cca-e946-47be-920c-d768a8923792",
        userId: "70e0cff2-7589-4de8-9f2f-4e372a5a15f3",
      },
      {
        name: "utilities",
        color: "#FF5555",
        id: "7dd5c4f4-a4d0-478d-9389-490b589dc0ed",
        userId: "70e0cff2-7589-4de8-9f2f-4e372a5a15f3",
      },
      {
        name: "food",
        color: "#9986dd",
        id: "d05a1cdd-5341-4abd-9a53-e1a012d0dd3d",
        userId: "70e0cff2-7589-4de8-9f2f-4e372a5a15f3",
      },
      {
        name: "transportation",
        color: "#AAAAAA",
        id: "d600f80e-5810-4dda-9081-04826d51f53d",
        userId: "70e0cff2-7589-4de8-9f2f-4e372a5a15f3",
      },
      {
        name: "insurance",
        color: "#fbb871",
        id: "3fdb010d-547d-451f-856a-0e0d3e207462",
        userId: "70e0cff2-7589-4de8-9f2f-4e372a5a15f3",
      },
      {
        name: "recreation",
        color: "#00FF95",
        id: "2cd7d5d9-be84-472d-ae2d-19b79b9b22fb",
        userId: "70e0cff2-7589-4de8-9f2f-4e372a5a15f3",
      },
      {
        name: "medical costs",
        color: "#ec6d71",
        id: "ebe8e21c-0420-46c3-ad02-f253c67914de",
        userId: "70e0cff2-7589-4de8-9f2f-4e372a5a15f3",
      },
      {
        name: "investing",
        color: "#b7d6b7",
        id: "5d538cf7-d781-4974-91a8-9b2335ae1aae",
        userId: "70e0cff2-7589-4de8-9f2f-4e372a5a15f3",
      },
      {
        name: "miscellaneous",
        color: "#5959ab",
        id: "2544e726-3c82-42f7-91b9-def5b4b4f444",
        userId: "70e0cff2-7589-4de8-9f2f-4e372a5a15f3",
      },
      {
        name: "memberships",
        color: "#FFD8CC",
        id: "8297ef3b-8790-44d8-86de-cf211f31dcfd",
        userId: "70e0cff2-7589-4de8-9f2f-4e372a5a15f3",
      },
      {
        name: "pets",
        color: "#f599dc",
        id: "4791d44d-3b4c-47e5-86b9-b96df69a1ba7",
        userId: "70e0cff2-7589-4de8-9f2f-4e372a5a15f3",
      },
    ],
  });
}

async function createExpenses() {
  await prisma.expense.createMany({
    data: [
      {
        id: uuidv4(),
        title: "Delta Supermarket",
        amount: 34.43,
        date: new Date("2022-12-10"),
        userId: "70e0cff2-7589-4de8-9f2f-4e372a5a15f3",
        categoryId: "d05a1cdd-5341-4abd-9a53-e1a012d0dd3d",
      },
      {
        id: uuidv4(),
        title: "Sushi Paradise",
        amount: 44.13,
        date: new Date("2022-12-10"),
        userId: "70e0cff2-7589-4de8-9f2f-4e372a5a15f3",
        categoryId: "d05a1cdd-5341-4abd-9a53-e1a012d0dd3d",
      },
      {
        id: uuidv4(),
        title: "Storm Energy",
        amount: 89.54,
        date: new Date("2022-12-07"),
        userId: "70e0cff2-7589-4de8-9f2f-4e372a5a15f3",
        categoryId: "3fdb010d-547d-451f-856a-0e0d3e207462",
      },
      {
        id: uuidv4(),
        title: "Health Insurance Company",
        amount: 125,
        date: new Date("2022-12-07"),
        userId: "70e0cff2-7589-4de8-9f2f-4e372a5a15f3",
        categoryId: "3fdb010d-547d-451f-856a-0e0d3e207462",
      },
      {
        id: uuidv4(),
        title: "Banana Company",
        amount: 13,
        date: new Date("2022-12-07"),
        userId: "70e0cff2-7589-4de8-9f2f-4e372a5a15f3",
        categoryId: "8297ef3b-8790-44d8-86de-cf211f31dcfd",
      },
      {
        id: uuidv4(),
        title: "test",
        amount: 100.43,
        date: new Date("2022-09-08"),
        userId: "70e0cff2-7589-4de8-9f2f-4e372a5a15f3",
        categoryId: "2544e726-3c82-42f7-91b9-def5b4b4f444",
      },
      {
        id: uuidv4(),
        title: "Lol Company",
        amount: 13,
        date: new Date("2022-08-10"),
        userId: "c97df944-505b-4508-8528-1de8da028fc7",
        categoryId: "2cd7d5d9-be84-472d-ae2d-19b79b9b22fb",
      },
      {
        id: uuidv4(),
        title: "Banana",
        amount: 13,
        date: new Date("2022-09-10"),
        userId: "70e0cff2-7589-4de8-9f2f-4e372a5a15f3",
        categoryId: "8297ef3b-8790-44d8-86de-cf211f31dcfd",
      },
      {
        id: uuidv4(),
        title: "test2",
        amount: 100.43,
        date: new Date("2022-10-11"),
        userId: "70e0cff2-7589-4de8-9f2f-4e372a5a15f3",
        categoryId: "2544e726-3c82-42f7-91b9-def5b4b4f444",
      },
      {
        id: uuidv4(),
        title: "test",
        amount: 13,
        date: new Date("2022-07-12"),
        userId: "c97df944-505b-4508-8528-1de8da028fc7",
        categoryId: "2cd7d5d9-be84-472d-ae2d-19b79b9b22fb",
      },
    ],
  });
}
