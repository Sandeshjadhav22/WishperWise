import {z} from 'zod'

export  const usernameValidation = z
        .string()
        .min(2,"Username must be atleaste 2 character")
        .max(20,"Must be more than not 20 charcter")
        .regex(/^[a-zA-Z0-9_]+$/, 'Username must not contain special characters');