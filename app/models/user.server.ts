import { prisma } from "~/db.server";
import { v4 as uuidv4 } from 'uuid';

export async function getUsers(){
  return prisma.user.findMany({
    include: {
      Expense: true,
      Budget: true
    }
  })
}

export async function createUser(){
  return prisma.user.create({
    data: {
      id: uuidv4(),
      username: "test",
      passwordHash:
        "$2a$10$Od4oIfW1IZyyQUvc.X96EOhCGNcG.XAm49fA/CA5F43znmgO2dCIe",
      firstName: "test",
      lastName: "testlast",
    }
  })
}