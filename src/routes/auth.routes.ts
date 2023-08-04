import { Router } from "express";

const router = Router()

router.post('/login', (req, res, next) => {})
router.post('/signup')
router.get('/verify')

export { router as authRoutes }