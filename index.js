const XLSX = require('xlsx')
const express = require('express')
const path = require('path')
const BodyParser = require('body-parser')
const Formidable = require('formidable')
const fs = require('fs')
const Helper = require('./helper')
const momentJalali = require('jalali-moment')
const Handlebars = require('hbs')

Handlebars.registerHelper('equal', (arg1, arg2, options) => {
    if (parseInt(arg1) === parseInt(arg2)) {
        return options.fn(this)
    }

    return options.inverse(this);
})

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
    
                await db.Interference.destroy({
                    where: {},
                })
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
                    interference: interferenceSheet

                } = workbook.Sheets

                if (!proffesorLessonSheet || !lessonSheet || !slotSheet || !interferenceSheet) return res.redirect('/')

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
                    await db.Lesson.create({ name: lessonInfo.lesson, count: lessonInfo.count, forYear: lessonInfo.forYear })
                    const year = await db.Year.findOne({ where: { value: lessonInfo.forYear } })
                    if (!year) await db.Year.create({ value: lessonInfo.forYear })
                }

                const proffesorLessons = Helper.parseProffesorLessonSheet(proffesorLessonSheet)
                for (const proffesorLesson of proffesorLessons) {
                    const proffesor = await db.Proffesor.findOne({
                        where: { name: proffesorLesson.proffesor }
                    })

                    const lessons = await db.Lesson.findAll({
                        where: { name: proffesorLesson.lesson }
                    })

                    for (const lesson of lessons) {
                        await db.ProffesorLesson.create({
                            proffesorId: proffesor.id,
                            lessonId: lesson.id
                        })
                    }
                }

                const interferences = Helper.parseInterferences(interferenceSheet)
                for (const interference of interferences) {
                    await db.Interference.create({ lessonOne: interference.lessonOne, lessonTwo: interference.lessonTwo })
                }

                return res.redirect('/result')
            })
        })
    })
})

app.get('/result', async (req, res) => {
    const years = await db.Year.findAll()
    const currentYear = years[0].value
    await Helper.resetTable(currentYear)
    const saturdayProffesors = await Helper.findWeekProffesor(0, currentYear)
    const saturday = await Helper.getWeekPlan(saturdayProffesors, 0)

    const sundayProffesors = await Helper.findWeekProffesor(1, currentYear)
    const sunday = await Helper.getWeekPlan(sundayProffesors, 1)

    const mondayProffesors = await Helper.findWeekProffesor(2, currentYear)
    const monday = await Helper.getWeekPlan(mondayProffesors, 2)

    const tuesdayProffesors = await Helper.findWeekProffesor(3, currentYear)
    const tuesday = await Helper.getWeekPlan(tuesdayProffesors, 3)

    const wendsdayProffesors = await Helper.findWeekProffesor(4, currentYear)
    const wendsday = await Helper.getWeekPlan(wendsdayProffesors, 4)

    res.render('result', { saturday, sunday, monday, tuesday, wendsday, years, currentYear })
})

app.get('/result/all', async (req, res) => {
    const years = await db.Year.findAll()
    await Helper.resetTable()

    const saturdayAll = [{ text: '' }, { text: '' }, { text: '' }, { text: '' }]
    const sundayAll = [{ text: '' }, { text: '' }, { text: '' }, { text: '' }]
    const mondayAll = [{ text: '' }, { text: '' }, { text: '' }, { text: '' }]
    const tuesdayAll = [{ text: '' }, { text: '' }, { text: '' }, { text: '' }]
    const wendsdayAll = [{ text: '' }, { text: '' }, { text: '' }, { text: '' }]

    for (const yearInstance of years) {
        const year = yearInstance.value
        const saturdayProffesors = await Helper.findWeekProffesor(0, year)
        const saturday = await Helper.getWeekPlan(saturdayProffesors, 0)

        saturday.forEach((value, index) => {
            if (value.proffesor !== '') {
                saturdayAll[index].text += `|  ${value.proffesor}-${value.lesson}-ساعت${value.time}`
            }
        })
    
        const sundayProffesors = await Helper.findWeekProffesor(1, year)
        const sunday = await Helper.getWeekPlan(sundayProffesors, 1)

        sunday.forEach((value, index) => {
            if (value.proffesor !== '') {
                sundayAll[index].text += `|  ${value.proffesor}-${value.lesson}-ساعت${value.time}`
            }
        })
    
        const mondayProffesors = await Helper.findWeekProffesor(2, year)
        const monday = await Helper.getWeekPlan(mondayProffesors, 2)

        monday.forEach((value, index) => {
            if (value.proffesor !== '') {
                mondayAll[index].text += `|  ${value.proffesor}-${value.lesson}-ساعت${value.time}`
            }
        })
    
        const tuesdayProffesors = await Helper.findWeekProffesor(3, year)
        const tuesday = await Helper.getWeekPlan(tuesdayProffesors, 3)

        tuesday.forEach((value, index) => {
            if (value.proffesor !== '') {
                tuesdayAll[index].text += `|  ${value.proffesor}-${value.lesson}-ساعت${value.time}`
            }
        })
    
        const wendsdayProffesors = await Helper.findWeekProffesor(4, year)
        const wendsday = await Helper.getWeekPlan(wendsdayProffesors, 4)

        wendsday.forEach((value, index) => {
            if (value.proffesor !== '') {
                wendsdayAll[index].text += `|  ${value.proffesor}-${value.lesson}-ساعت${value.time}`
            }
        })
    }

    res.render(
        'all',
        {
            years,
            saturday: saturdayAll,
            sunday: sundayAll,
            monday: mondayAll,
            tuesday: tuesdayAll,
            wendsday: wendsdayAll
        }
    )
})

app.get('/result/:year', async (req, res) => {
    const years = await db.Year.findAll()
    const currentYear = req.params.year
    await Helper.resetTable(currentYear)
    const saturdayProffesors = await Helper.findWeekProffesor(0, currentYear)
    const saturday = await Helper.getWeekPlan(saturdayProffesors, 0)

    const sundayProffesors = await Helper.findWeekProffesor(1, currentYear)
    const sunday = await Helper.getWeekPlan(sundayProffesors, 1)

    const mondayProffesors = await Helper.findWeekProffesor(2, currentYear)
    const monday = await Helper.getWeekPlan(mondayProffesors, 2)

    const tuesdayProffesors = await Helper.findWeekProffesor(3, currentYear)
    const tuesday = await Helper.getWeekPlan(tuesdayProffesors, 3)

    const wendsdayProffesors = await Helper.findWeekProffesor(4, currentYear)
    const wendsday = await Helper.getWeekPlan(wendsdayProffesors, 4)

    res.render('result', { saturday, sunday, monday, tuesday, wendsday, years, currentYear })
})

app.post('/export', async (req, res) => {
    res.redirect('/result')
})

app.listen(4000, () => console.log('server started on port 4000'))