const db = require('../models')

const parseProffesorSheet = (sheet) => {
    const keys = Object.keys(sheet)

    const size = (keys.length / 6)

    console.log('size is ', size)

    const result = []
    for (let i = 2; i <= size; i++) { 
        result.push({
            proffesor: sheet[`A${i}`].v,
            saturdayHoursWorking: sheet[`B${i}`].v.split(','),
            sundayHoursWorking: sheet[`C${i}`].v.split(','),
            mondayHoursWorking: sheet[`D${i}`].v.split(','),
            tuesdayHoursWorking: sheet[`E${i}`].v.split(','),
            wendsdayHoursWorking: sheet[`F${i}`].v.split(','),
        })
    }

    return result
}

const parseLessonSheet = (sheet) => {
    const keys = Object.keys(sheet)

    const size = (keys.length / 7)

    const result = []

    for (let i = 2; i <= size; i++) {
        result.push({
            lesson: sheet[`A${i}`].v,
            count:
                sheet[`B${i}`].v +
                sheet[`C${i}`].v +
                sheet[`D${i}`].v +
                sheet[`E${i}`].v +
                sheet[`F${i}`].v +
                sheet[`G${i}`].v
        })
    }

    return result
}

const parseProffesorLessonSheet = (sheet) => {
    const keys = Object.keys(sheet)

    const size = (keys.length / 2)

    const result = []

    for (let i = 2; i <= size; i++) {
        result.push({
            proffesor: sheet[`A${i}`].v,
            lesson: sheet[`B${i}`].v,
        })
    }

    return result
}

const parseClassesSheet = (sheet) => {
    const keys = Object.keys(sheet)

    const size = (keys.length / 7)

    console.log('size is ', size)

    const result = []

    for (let i = 2; i <= size; i++) {
        result.push({
            lesson: sheet[`A${i}`].v,
            className: sheet[`B${i}`].v,
        })
    }

    return result
}

const getTime = (index) => {
    const time = ['8-10', '10-12', '14-16', '16-18']

    return time[index]
}

const findWeekProffesor = async (weekNumber) => {
    const where = {}

    switch (weekNumber) {
        case 0: {
            where.weekDay = 'شنبه'
            break
        }
        case 1: { 
            where.weekDay = 'یکشنبه'
            break
        }
        case 2: {
            where.weekDay = 'دوشنبه'
            break
        }
        case 3: {
            where.weekDay = 'سه‌شنبه'
            break
        }
        case 4: {
            where.weekDay = 'چهارشنبه'
            break
        }
    }

    where.isTaken = false

    const result = await db.Proffesor.findAll({
        include: [
            { model: db.Slot, where, required: true },
            {
                model: db.Lesson,
                attributes: ['id', 'name', 'count', 'isTaken'],
                where: { isTaken: false },
                required: true,
                include: db.Class
            }
        ]
    })

    return result
}

const getWeekPlan = async (weekProffesors) => {
    const result = []
    let count = 0
    for (const weekProffesor of weekProffesors) {
        const proffesor = weekProffesor.name
        const slots = weekProffesor.slots

        for (const slot of slots) {
            const lessons = weekProffesor.lessons

            if (!slot.isTaken) {
                for (const lesson of lessons) {
                    if (!lesson.isTaken && result.length < 4) {
                        count = count + 1
    
                        await slot.update({ isTaken: true })
                        await lesson.update({ isTaken: true })
    
                        console.log('this is class', lesson)
    
                        result.push({
                            proffesor,
                            lesson: lesson.name,
                            time: slot.hours,
                            class: lesson.class.name
                        })
                    }
                }
            }
        }
    }

    return result
}

module.exports = {
    parseProffesorSheet,
    parseLessonSheet,
    parseProffesorLessonSheet,
    parseClassesSheet,
    getTime,
    findWeekProffesor,
    getWeekPlan
}