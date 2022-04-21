/* eslint-disable linebreak-style */
import {
    Source,
    Manga,
    Chapter,
    ChapterDetails,
    HomeSection,
    SearchRequest,
    PagedResults,
    SourceInfo,
    MangaUpdates,
    TagType,
    TagSection,
    ContentRating,
    Request,
    Response,
} from 'paperback-extensions-common'
import {
    parseMangaDetails,
} from './ManHuaGuiParser'

const MHG_DOMAIN = 'https://www.manhuagui.com'

export const ManHuaGuiInfo: SourceInfo = {
    version: '1.0.0',
    name: 'ManHuaGui (漫画柜)',
    icon: 'favicon.png',
    author: 'Ynng',
    description: 'Extension that pulls manga from ManHuaGui',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: MHG_DOMAIN,
    authorWebsite: 'https://github.com/Ynng',
    language: 'zh-CN',
    sourceTags: [],
}

export class ManHuaGui extends Source {
    override getMangaShareUrl(mangaId: string): string {
        return `${MHG_DOMAIN}/comic/${mangaId}`
    }

    async getMangaDetails(mangaId: string): Promise<Manga> {
        const request = createRequestObject({
            url: `${MHG_DOMAIN}/comic`,
            method: 'GET',
            param: mangaId,
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        return parseMangaDetails($, mangaId)
    }
}
