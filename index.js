const XLSX = require('xlsx')
const express = require('express')
const path = require('path')
const BodyParser = require('body-parser')
const Formidable = require('formidable')
const fs = require('fs')
const Helper = require('./helper')
const momentJalali = require('jalali-moment')

const app = express()

// db connection
const db = require('./models')

app.use(express.static(path.join(__dirname, 'public')))
app.set('views', './views/layouts')
app.set('view engine', 'hbs')
app.use(BodyParser.json())
app.use(BodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    res.render('home')
})

app.post('/uploads', (req, res) => {
    new Formidable.IncomingForm().parse(req, (err, field, files) => {
        if (err) {
            console.log(err)
            res.redirect('/')
        }

        const file = files.this

        fs.readFile(file.path, (err, data) => {
            if (err) return console.log('read file error', err)

            fs.writeFile(__dirname + '/public/uploads/data.xlsx', data, async (err) => {
                if (err) return console.log('write file error', err)
    
                await db.Slot.destroy({
                    where: {},
                })
                await db.ProffesorLesson.destroy({
                    where: {},
                })
                await db.Proffesor.destroy({
                    where: {},
                })
                await db.Lesson.destroy({
                    where: {},
                })
                await db.ProffesorSlot.destroy({
                    where: {},
                })
            
                const workbook = XLSX.readFile(__dirname + '/public/uploads/data.xlsx')
                const {
                    proffesorLessons: proffesorLessonSheet,
                    lessons: lessonSheet,
                    slots: slotSheet,
                    classes: classesSheet
                } = workbook.Sheets

                const proffesorSlots = Helper.parseProffesorSheet(slotSheet)
                for (const proffesorSlot of proffesorSlots) {
                    const proffesor = await db.Proffesor.create({ name: proffesorSlot.proffesor })

                    const saturdayWorkingHours = proffesorSlot.saturdayHoursWorking
                    const sundayWorkingHours = proffesorSlot.sundayHoursWorking
                    const mondayWorkingHours = proffesorSlot.mondayHoursWorking
                    const tuesdayWorkingHours = proffesorSlot.tuesdayHoursWorking
                    const wendsdayWorkingHours = proffesorSlot.wendsdayHoursWorking

                    for (const index in saturdayWorkingHours) {
                        if (saturdayWorkingHours[index] === '1') {
                            const hours = Helper.getTime(index)
                            const slot = await db.Slot.create({ hours, weekDay: 'شنبه' })
                            await db.ProffesorSlot.create({ proffesorId: proffesor.id, slotId: slot.id })
                        }
                    }

                    for (const index in sundayWorkingHours) {
                        if (sundayWorkingHours[index] === '1') {
                            const hours = Helper.getTime(index)
                            const slot = await db.Slot.create({ hours, weekDay: 'یکشنبه' })
                            await db.ProffesorSlot.create({ proffesorId: proffesor.id, slotId: slot.id })
                        }
                    }

                    for (const index in mondayWorkingHours) {
                        if (mondayWorkingHours[index] === '1') {
                            const hours = Helper.getTime(index)
                            const slot = await db.Slot.create({ hours, weekDay: 'دوشنبه' })
                            await db.ProffesorSlot.create({ proffesorId: proffesor.id, slotId: slot.id })
                        }
                    }

                    for (const index in tuesdayWorkingHours) {
                        if (tuesdayWorkingHours[index] === '1') {
                            const hours = Helper.getTime(index)
                            const slot = await db.Slot.create({ hours, weekDay: 'سه‌شنبه' })
                            await db.ProffesorSlot.create({ proffesorId: proffesor.id, slotId: slot.id })
                        }
                    }

                    for (const index in wendsdayWorkingHours) {
                        if (wendsdayWorkingHours[index] === '1') {
                            const hours = Helper.getTime(index)
                            const slot = await db.Slot.create({ hours, weekDay: 'چهارشنبه' })
                            await db.ProffesorSlot.create({ proffesorId: proffesor.id, slotId: slot.id })
                        }
                    }
                }
                
                const lessons = Helper.parseLessonSheet(lessonSheet)
                for (const lessonInfo of lessons) {
                    await db.Lesson.create({ name: lessonInfo.lesson, count: lessonInfo.count })
                }

                const proffesorLessons = Helper.parseProffesorLessonSheet(proffesorLessonSheet)
                for (const proffesorLesson of proffesorLessons) {
                    const proffesor = await db.Proffesor.findOne({
                        where: { name: proffesorLesson.proffesor }
                    })

                    const lesson = await db.Lesson.findOne({
                        where: { name: proffesorLesson.lesson }
                    })

                    await db.ProffesorLesson.create({
                        proffesorId: proffesor.id,
                        lessonId: lesson.id
                    })
                }

                const classes = Helper.parseClassesSheet(classesSheet)
                for (const classInfo of classes) {
                    const lesson = await db.Lesson.findOne({ where: { name: classInfo.lesson } })

                    await db.Class.create({ lessonId: lesson.id, name: `${classInfo.className}` })
                }

                return res.redirect('/result')
            })
        })
    })
})

app.get('/result', async (req, res) => {
    await db.Lesson.update({ isTaken: false }, { where: {} })
    const saturdayProffesors = await Helper.findWeekProffesor(0)
    const saturday = await Helper.getWeekPlan(saturdayProffesors)

    const sundayProffesors = await Helper.findWeekProffesor(1)
    const sunday = await Helper.getWeekPlan(sundayProffesors)

    const mondayProffesors = await Helper.findWeekProffesor(2)
    const monday = await Helper.getWeekPlan(mondayProffesors)

    const tuesdayProffesors = await Helper.findWeekProffesor(3)
    const tuesday = await Helper.getWeekPlan(tuesdayProffesors)

    const wendsdayProffesors = await Helper.findWeekProffesor(4)
    const wendsday = await Helper.getWeekPlan(wendsdayProffesors)

    res.render('result', { saturday, sunday, monday, tuesday, wendsday })
})

app.listen(4000, () => console.log('server started on port 4000'))