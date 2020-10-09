const parseProffesorSheet = (sheet) => {
    const keys = Object.keys(sheet)

    const size = (keys.length / 2)

    const result = []
    for (let i = 1; i <= size; i++) {
        result.push({
            id: sheet[`A${i}`].v,
            name: sheet[`B${i}`].v,
        })
    }

    return result
}

const parseLessonSheet = (sheet) => {
    const keys = Object.keys(sheet)

    const size = (keys.length / 3)

    const result = []

    for (let i = 1; i <= size; i++) {
        result.push({
            id: sheet[`A${i}`].v,
            name: sheet[`B${i}`].v,
            studentCount: sheet[`C${i}`].v
        })
    }

    return result
}

const parseProffesorLessonSheet = (sheet) => {
    const keys = Object.keys(sheet)

    const size = (keys.length / 3)

    const result = []

    for (let i = 1; i <= size; i++) {
        result.push({
            id: sheet[`A${i}`].v,
            proffesorId: sheet[`B${i}`].v,
            lessonId: sheet[`C${i}`].v
        })
    }

    return result
}

const parseSlotSheet = (sheet) => {
    const keys = Object.keys(sheet)

    const size = (keys.length / 5)

    const result = []

    for (let i = 1; i <= size; i++) {
        result.push({
            id: sheet[`A${i}`].v,
            proffesorId: sheet[`B${i}`].v,
            startTime: sheet[`C${i}`].v,
            endTime: sheet[`D${i}`].v,
            isOk: sheet[`E${i}`].v
        })
    }

    return result
}

module.exports = {
    parseProffesorSheet,
    parseLessonSheet,
    parseProffesorLessonSheet,
    parseSlotSheet
}