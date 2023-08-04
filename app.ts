import express from 'express'
import { allRoutes } from './src/routes'
import { requestLogger } from './src/utils/logger'
import { notFound } from './src/routes/notFound.routes'

const app = express()

app.use(requestLogger)

app.use(express.json())

app.use('/', allRoutes)

export { app }