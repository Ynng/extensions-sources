/* eslint-disable linebreak-style */
/* eslint-disable @typescript-eslint/no-unused-vars */
import moment from 'moment'
import {
    Chapter,
    ChapterDetails,
    LanguageCode,
    Manga,
    MangaStatus,
    MangaTile,
    HomeSection,
} from 'paperback-extensions-common'

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
    const rawChapters = $('ul > li > a.status0').toArray()
    const chapters: Chapter[] = []

    for (const rawChapter of rawChapters) {
        const $el = $(rawChapter)
        const url = $el.attr('href') ?? ''
        const name = $el.attr('title') ?? ''
        // remove .html from id
        const id = (url.split('/')[3] ?? '').replace(/\.html$/, '')
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

const jsDecodeFunc = `
var LZString=(function(){var f=String.fromCharCode;var keyStrBase64="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";var baseReverseDic={};function getBaseValue(alphabet,character){if(!baseReverseDic[alphabet]){baseReverseDic[alphabet]={};for(var i=0;i<alphabet.length;i++){baseReverseDic[alphabet][alphabet.charAt(i)]=i}}return baseReverseDic[alphabet][character]}var LZString={decompressFromBase64:function(input){if(input==null)return"";if(input=="")return null;return LZString._0(input.length,32,function(index){return getBaseValue(keyStrBase64,input.charAt(index))})},_0:function(length,resetValue,getNextValue){var dictionary=[],next,enlargeIn=4,dictSize=4,numBits=3,entry="",result=[],i,w,bits,resb,maxpower,power,c,data={val:getNextValue(0),position:resetValue,index:1};for(i=0;i<3;i+=1){dictionary[i]=i}bits=0;maxpower=Math.pow(2,2);power=1;while(power!=maxpower){resb=data.val&data.position;data.position>>=1;if(data.position==0){data.position=resetValue;data.val=getNextValue(data.index++)}bits|=(resb>0?1:0)*power;power<<=1}switch(next=bits){case 0:bits=0;maxpower=Math.pow(2,8);power=1;while(power!=maxpower){resb=data.val&data.position;data.position>>=1;if(data.position==0){data.position=resetValue;data.val=getNextValue(data.index++)}bits|=(resb>0?1:0)*power;power<<=1}c=f(bits);break;case 1:bits=0;maxpower=Math.pow(2,16);power=1;while(power!=maxpower){resb=data.val&data.position;data.position>>=1;if(data.position==0){data.position=resetValue;data.val=getNextValue(data.index++)}bits|=(resb>0?1:0)*power;power<<=1}c=f(bits);break;case 2:return""}dictionary[3]=c;w=c;result.push(c);while(true){if(data.index>length){return""}bits=0;maxpower=Math.pow(2,numBits);power=1;while(power!=maxpower){resb=data.val&data.position;data.position>>=1;if(data.position==0){data.position=resetValue;data.val=getNextValue(data.index++)}bits|=(resb>0?1:0)*power;power<<=1}switch(c=bits){case 0:bits=0;maxpower=Math.pow(2,8);power=1;while(power!=maxpower){resb=data.val&data.position;data.position>>=1;if(data.position==0){data.position=resetValue;data.val=getNextValue(data.index++)}bits|=(resb>0?1:0)*power;power<<=1}dictionary[dictSize++]=f(bits);c=dictSize-1;enlargeIn--;break;case 1:bits=0;maxpower=Math.pow(2,16);power=1;while(power!=maxpower){resb=data.val&data.position;data.position>>=1;if(data.position==0){data.position=resetValue;data.val=getNextValue(data.index++)}bits|=(resb>0?1:0)*power;power<<=1}dictionary[dictSize++]=f(bits);c=dictSize-1;enlargeIn--;break;case 2:return result.join('')}if(enlargeIn==0){enlargeIn=Math.pow(2,numBits);numBits++}if(dictionary[c]){entry=dictionary[c]}else{if(c===dictSize){entry=w+w.charAt(0)}else{return null}}result.push(entry);dictionary[dictSize++]=w+entry.charAt(0);enlargeIn--;w=entry;if(enlargeIn==0){enlargeIn=Math.pow(2,numBits);numBits++}}}};return LZString})();String.prototype.splic=function(f){return LZString.decompressFromBase64(this).split(f)};var SMH = {
    imgData: function (imageData) {
        return {
            preInit: function () {
                imageInfo = imageData;
            },
        }
    },
};`

export const parseChapterDetails = (
    _$: cheerio.Root,
    mangaId: string,
    chapterId: string,
    rawResponse: string
): ChapterDetails => {
    // Page list is javascript eval encoded and LZString encoded
    // regex to find the javascript eval
    const evalRe = /window\[".*?"\](\(.*\)\s*\{[\s\S]+\}\s*\(.*\))/
    const evalMatch = evalRe.exec(rawResponse)
    if (evalMatch === null) {
        throw new Error('Could not find eval')
    }
    // get the javascript eval
    const evalString = evalMatch[1] ?? ''

    // eslint-disable-next-line prefer-const
    let imageInfo = {
        files: [],
        path: '',
    }
    eval(jsDecodeFunc + 'eval' + evalString)

    const imageData = imageInfo

    console.log(imageInfo)

    const images: string[] = imageData.files.map((image: string) => {
        return `${IMAGE_SERVERS[0]}${encodeURI(imageData.path)}${image}`
    })

    console.log(images)

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
    const pageTurnButtons = $('#AspNetPagerResult > a').toArray()
    // loop through the page turn buttons and check for the next page button
    for (const pageTurnButton of pageTurnButtons) {
        const $el = $(pageTurnButton)
        const text = $el.text() ?? ''
        if (text === '下一页' || text === '下一頁') {
            return false
        }
    }
    return true
}

export const parseHomeSections = (
    $: cheerio.Root,
    sectionCallback: (section: HomeSection) => void
): void => {
    const sections = [
        {
            sectionID: createHomeSection({
                id: 'hot_ongoing',
                title: '热门连载漫画',
            }),
            selector: $('#cmt-cont > ul:nth-child(1)'),
        },
        {
            sectionID: createHomeSection({
                id: 'classic_completed',
                title: '经典完结漫画',
            }),
            selector: $('#cmt-cont > ul:nth-child(2)'),
        },
        {
            sectionID: createHomeSection({
                id: 'newest',
                title: '最新上架漫画',
            }),
            selector: $('#cmt-cont > ul:nth-child(3)'),
        },
        {
            sectionID: createHomeSection({
                id: 'recent_anime_adaptations',
                title: '新番漫画',
            }),
            selector: $('#cmt-cont > ul:nth-child(4)'),
        },
    ]

    for (const section of sections) {
        const mangaArray: MangaTile[] = []
        for (const manga of $('li', section.selector).toArray()) {
            const url = $('a.bcover', manga).attr('href') ?? ''
            const id = url.split('/')[2] ?? ''
            const title = $('a.bcover', manga).attr('title') ?? ''
            // image could be on src or data-src
            const image = `https:${
                $('a.bcover > img', manga).attr('src') ??
                $('a.bcover > img', manga).attr('data-src')
            }`
            mangaArray.push(
                createMangaTile({
                    id: id,
                    title: createIconText({ text: title }),
                    image: image,
                })
            )
        }
        section.sectionID.items = mangaArray
        sectionCallback(section.sectionID)
    }
}
