/* eslint-disable linebreak-style */
import moment from 'moment'
import {
    Chapter,
    ChapterDetails,
    Tag,
    HomeSection,
    LanguageCode,
    Manga,
    MangaStatus,
    MangaTile,
    TagSection,
} from 'paperback-extensions-common'

export const parseMangaDetails = ($: cheerio.Root, mangaId: string): Manga => {
    const titles = $('div.book-title')
        .children()
        .map((_, el) => $(el).text())
        .get()
    const image = `https:${$('p.hcover > img').attr('src')}`
    const rating = parseFloat($('p.score-avg em').text())

    const description = $('div#intro-all').text().trim()
    const author = $(
        'span:contains(漫画作者) > a , span:contains(漫畫作者) > a'
    )
        .text()
        .trim()
        .replace(' ', ', ')
    const statusString = $(
        'div.book-detail > ul.detail-list > li.status > span > span'
    )
        .first()
        .text()

    let status = MangaStatus.UNKNOWN
    // match both simplified and traditional Chinese
    const ongoingRe = /连载中|連載中/
    const completedRe = /已完结|已完結/
    if (ongoingRe.test(statusString)) {
        status = MangaStatus.ONGOING
    } else if (completedRe.test(statusString)) {
        status = MangaStatus.COMPLETED
    }

    // second element
    const lastUpdatedString = $(
        'div.book-detail > ul.detail-list > li.status > span > span'
    )
        .last()
        .text()
    const lastUpdated = moment(lastUpdatedString, 'YYYY-MM-DD').toDate()

    return createManga({
        id: mangaId,
        titles: titles,
        image: image,
        rating: rating,
        desc: description,
        author: author,
        status: status,
        lastUpdate: lastUpdated,
    })
}

export const parseChapters = ($: cheerio.Root, mangaId: string): Chapter[] => {
    const rawChapters = $('ul > li > a.status0')
    const chapters: Chapter[] = []

    for (const rawChapter of rawChapters) {
        const $el = $(rawChapter)
        const url = $el.attr('href') ?? ''
        const name = $el.text() ?? ''
        // if can't find url, error
        const id = url.split('/')[3] ?? ''
        const chapNum = parseInt((name.match(/\d+/) ?? ['0'])[0] ?? '0', 10)

        chapters.push(
            createChapter({
                id: id,
                name: name,
                mangaId: mangaId,
                langCode: LanguageCode.CHINEESE,
                chapNum: chapNum,
            })
        )
    }

    return chapters
}
