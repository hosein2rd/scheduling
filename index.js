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
            
                const workbook = XLSX.readFile(__dirname + '/public/uploads/data.xlsx')
                const {
                    Proffesors: proffesorSheet,
                    Lessons: lessonSheet,
                    Slots: slotSheet,
                    ProffesorLessons: proffesorLessonSheet
                } = workbook.Sheets

                const proffesors = Helper.parseProffesorSheet(proffesorSheet)
                const lessons = Helper.parseLessonSheet(lessonSheet)
                const proffesorLessons = Helper.parseProffesorLessonSheet(proffesorLessonSheet)
                const slots = Helper.parseSlotSheet(slotSheet)

                for (const proffesor of proffesors) {
                    await db.Proffesor.create({ id: proffesor.id, name: proffesor.name })
                }

                for (const lesson of lessons) {
                    await db.Lesson.create({
                        id: lesson.id,
                        name: lesson.name,
                        studentCount: lesson.studentCount
                    })
                }

                for (const pl of proffesorLessons) {
                    await db.ProffesorLesson.create({
                        id: pl.id,
                        proffesorId: pl.proffesorId,
                        lessonId: pl.lessonId
                    })
                }

                for (const slot of slots) {
                    await db.Slot.create({
                        id: slot.id,
                        startTime: new Date(slot.startTime * 1000),
                        endTime: new Date(slot.endTime * 1000),
                        isOk: slot.isOk,
                        proffesorId: slot.proffesorId
                    })
                }
            })

            res.redirect('/result')
        })
    })
})

app.get('/result', async (req, res) => {

    const proffesors = await db.Proffesor.findAll({
        include: [
            { model: db.Lesson, order: [['studentCount', 'DESC']] },
            { model: db.Slot, order: [['startTime', 'ASC']] }
        ]
    })

    const result = []

    for (const proffesor of proffesors) {
        
        const obj = { name: proffesor.name }

        for (const lesson of proffesor.lessons) {
            if (proffesor.slots && proffesor.slots.length !== 0) {
                for (const slot of proffesor.slots) {
                    if (slot.isOk) {
                        obj.lesson = lesson.name

                        if (!hasConflict(result, new Date(slot.startTime), new Date(slot.endTime))) {
                            obj.startDate = momentJalali(slot.startTime, 'YYYY/MM/DD').local('fa').format('jYYYY/jMM/jDD HH:MM')
                            obj.endDate = momentJalali(slot.endTime, 'YYYY/MM/DD').local('fa').format('YYYY/MM/DD HH:MM')

                            result.push(obj)

                            break
                        }
                    }
                }
            }
        } 
    }

    res.render('result', { result })
})

const hasConflict = (result, startTime, endTime) => {
    if (result.length === 0) return false

    for (const r of result) {
        if (r.startDate < startTime && startTime < r.endDate) return true
        if (r.startDate < endTime && endTime < r.endDate) return true
    }

    return false
}


app.listen(4000, () => console.log('server started on port 4000'))