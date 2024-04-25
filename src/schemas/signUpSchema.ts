import {z} from 'zod'

export  const usernameValidation = z
        .string()
        .min(2,"Username must be atleaste 2 character")
        .max(20,"Must be more than not 20 charcter")
        .regex(/^[a-zA-Z0-9_]+$/, 'Username must not contain special characters');

export const signUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email({message:"Invalid email address"}),
    password: z.string().min(6,{message:"Password must be atleast 6 char"})
})        