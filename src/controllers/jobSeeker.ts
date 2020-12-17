import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import {
  NotFoundError,
  UnauthorizedError,
  InternalServerError,
  BadRequestError,
} from '../helpers/apiError'
import JobSeeker from '../entities/JobSeeker.postgres'
import Credential from '../entities/Credential.postgres'

// Auth Controllers for job seeker
export const jobSeekerLocalLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate('local', (error, jobSeeker: JobSeeker, info) => {
    if (error) {
      return next(new InternalServerError())
    }
    if (!jobSeeker) {
      if (info.message === 'Invalid email or password') {
        return next(new UnauthorizedError(info.message))
      }
      return next(new NotFoundError(info.message))
    }
    const id = jobSeeker.id // this is to extract the id of user
    const token = jwt.sign(
      // sign method will generate the token
      { id: id, role: jobSeeker.role }, // id and role are unique identifiers to sign the token
      process.env.JWT_SECRET as string // this is the identity of application for JWT and
      // using as a file module
    )
    console.log('Encoded JWT token is ', token)
    // when the token is decoded, we can get the user info
    const decoded = jwt.decode(token)
    console.log('token after decoded', decoded)
    const userSerialize = { ...jobSeeker, token }
    res.deliver(200, 'Success', userSerialize)
  })(req, res, next)
}

export const createJobSeeker = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { info, credential, skills } = req.body
    const exists = await Credential.findOne({
      where: { email: credential.email },
    })

    if (exists) {
      return next(
        new BadRequestError(`Email ${credential.email} already exists`)
      )
    }

    credential.password = await bcrypt.hash(credential.password, 8)
    const newCredential = Credential.create({ ...credential })
    const newJobSeeker = JobSeeker.create({
      ...info,
      credentials: newCredential,
      skills: skills,
    })

    await JobSeeker.save(newJobSeeker)

    res.deliver(201, 'Success')
  } catch (error) {
    next(new InternalServerError(error.message))
  }
}

export const getJobSeeker = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await JobSeeker.find({ relations: ['credentials'] })
    res.json(user)
  } catch (error) {
    console.log(error)
  }
}

export const updateJobSeeker = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const update = req.body
    const jobSeeker = (req.user as unknown) as JobSeeker

    if (!jobSeeker) {
      return next(new NotFoundError(`${jobSeeker} not found`))
    }
    if (update.firstName) {
      jobSeeker!.firstName = update.firstName
    }
    if (update.lastName) {
      jobSeeker!.lastName = update.lastName
    }
    if (update.contact) {
      jobSeeker!.contact = update.contact
    }
    if (update.relocate) {
      jobSeeker!.relocate = update.relocate
    }
    if (update.seniority) {
      jobSeeker!.seniority = update.seniority
    }
    if (update.startingDate) {
      jobSeeker!.startingDate = update.startingDate
    }
    if (update.skills) {
      jobSeeker.skills = update.skills
    }

    const updated = await JobSeeker.save(jobSeeker)
    res.deliver(200, 'Updated', updated)
  } catch (error) {
    next(new NotFoundError('ID NOT FIND'))
  }
}
// read user profile
// export const readMyProfile = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const userId = req.params.id
//     const user = await JobSeeker.findOne(userId)
//     console.log('I am reading my profile ', user)
//   } catch (e) {
//     return next(new NotFoundError())
//   }
// }
