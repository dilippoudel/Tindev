import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm'

import Education from './Education.postgres'
import Skill from './Skill.postgres'

@Entity()
export default class JobSeeker extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  firstName!: string

  @Column()
  lastName!: string

  @Column()
  email!: string

  @Column()
  password!: string

  @Column()
  image!: string

  @Column()
  contact!: number

  @Column()
  relocate!: boolean

  @Column()
  seniority!: string

  @Column()
  startingDate!: Date

  @CreateDateColumn()
  created!: Date

  @Column({
    name: 'role',
    default: 'job seeker',
  })
  @OneToOne(() => Education)
  @JoinColumn()
  education!: Education

  @OneToMany(() => Skill, (skill) => skill.jobSeeker)
  skills!: Skill[]
}
