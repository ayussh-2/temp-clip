import { customAlphabet } from "nanoid";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const CODE_LENGTH = 6;

export const generateSessionCode = customAlphabet(ALPHABET, CODE_LENGTH);
