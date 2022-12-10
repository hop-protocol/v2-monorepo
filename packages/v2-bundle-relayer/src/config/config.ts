import dotenv from 'dotenv'
dotenv.config()

export const dbPath = process.env.DBPATH ?? '/tmp/tempdb'
export const privateKey = process.env.PRIVATE_KEY
