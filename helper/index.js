const db = require('../models')

const parseProffesorSheet = (sheet) => {
    const keys = Object.keys(sheet)

    const size = (keys.length / 6)

    console.log('size is ', size)

    const result = []
    for (let i = 2; i <= size; i++) {
        result.push({
            proffesor: sheet[`A${i}`].v,
            saturday: sheet[`B${i}`].v,
            sunday: sheet[`C${i}`].v,
            monday: sheet[`D${i}`].v,
            tuesday: sheet[`E${i}`].v,
            wendsday: sheet[`F${i}`].v,
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

    const size = (keys.length / 2)

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
    const time = ['8 - 10', '10-12', '14 - 16', '16 - 18']

    return time[index]
}

const findWeekProffesor = async (weekNumber) => {
    const where = {}

    switch (weekNumber) {
        case 0: {
            where.saturday = true
            break
        }
        case 1: { 
            where.sunday = true
            break
        }
        case 2: {
            where.monday = true
            break
        }
        case 3: {
            where.tuesday = true
            break
        }
        case 4: {
            where.wendsday = true
            break
        }
    }

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
        
        if (count < 4) {
            const lessons = weekProffesor.lessons

            for (const lesson of lessons) {
                if (!lesson.isTaken) {
                    count = count + 1

                    await lesson.update({ isTaken: true })

                    console.log('this is class', lesson)

                    result.push({
                        proffesor,
                        lesson: lesson.name,
                        time: getTime(count - 1),
                        class: lesson.class.name
                    })
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