/* eslint-disable linebreak-style */
import { map } from 'cheerio/lib/api/traversing'
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
import { evalManHuaGui } from './ManHuaGuiHelper.js'

const MHG_DOMAIN = 'https://www.manhuagui.com'
const IMAGE_SERVERS = ['https://i.hamreus.com', 'https://cf.hamreus.com']

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

export const parseChapterDetails = (
    $: cheerio.Root,
    mangaId: string,
    chapterId: string,
    rawResponse: string
): ChapterDetails => {
    // get the number of pages
    const pageSelector = $('#pageSelect')
    // page count is the number of children of the page selector
    const pageCount = pageSelector.children().length

    // Page list is javascript eval encoded and LZString encoded
    // regex to find the javascript eval
    const evalRe = /window\[".*?"\](\(.*\)\s*\{[\s\S]+\}\s*\(.*\))/
    const evalMatch = evalRe.exec(rawResponse)
    if (evalMatch === null) {
        throw new Error('Could not find eval')
    }
    // get the javascript eval
    let evalString = evalMatch[1] ?? ''
    // strip the window[xxxx]
    evalString = evalString.replace(/window\[".*?"\]/g, '').trim()
    // strip the () on the beginning and end
    evalString = evalString.replace(/^\(/, '').replace(/\)$/, '')
    // eval the javascript eval
    const imageData = evalManHuaGui(evalString)

    const images: string[] = imageData.files.map((image: string) => {
        return `${IMAGE_SERVERS[0]}${imageData.path}${image}`
    })

    return createChapterDetails({
        id: chapterId,
        mangaId: mangaId,
        pages: images,
        longStrip: false,
    })
}

export const parseSearch = ($: cheerio.Root): MangaTile[] => {
    const mangaItems: MangaTile[] = []

    for (const manga of $('div.book-result > ul > li').toArray()) {
        const link = $('a.bcover', manga).attr('href') ?? ''
        const id = link.split('/')[2] ?? ''
        const title = $('a.bcover', manga).attr('title') ?? ''
        const image = `https:${$('a.bcover > img', manga).attr('src')}`
        mangaItems.push(
            createMangaTile({
                id: id,
                title: createIconText({ text: title }),
                image: image,
            })
        )
    }

    return mangaItems
}

export const isLastPage = ($: cheerio.Root): boolean => {
    // check for the next page button
    const pageTurnButtons = $('#AspNetPagerResult > a')
    // loop through the page turn buttons and check for the next page button
    for (const pageTurnButton of pageTurnButtons) {
        const $el = $(pageTurnButton)
        const text = $el.text() ?? ''
        if (text === '下一页'|| text === '下一頁') {
            return false
        }
    }
    return true
}
