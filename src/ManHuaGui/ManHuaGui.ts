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
    parseChapters,
    parseChapterDetails,
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
    requestManager = createRequestManager({
        requestsPerSecond: 5,
        requestTimeout: 20000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {
                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        referer: MHG_DOMAIN,
                    },
                }

                return request
            },

            interceptResponse: async (
                response: Response
            ): Promise<Response> => {
                return response
            },
        },
    })

    override getMangaShareUrl(mangaId: string): string {
        return `${MHG_DOMAIN}/comic/${mangaId}`
    }

    async getMangaDetails(mangaId: string): Promise<Manga> {
        const request = createRequestObject({
            url: `${MHG_DOMAIN}/comic/`,
            method: 'GET',
            param: mangaId,
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        return parseMangaDetails($, mangaId)
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = createRequestObject({
            url: `${MHG_DOMAIN}/comic/`,
            method: 'GET',
            param: mangaId,
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        return parseChapters($, mangaId)
    }

    async getChapterDetails(
        mangaId: string,
        chapterId: string
    ): Promise<ChapterDetails> {
        const request = createRequestObject({
            url: `${MHG_DOMAIN}/comic/`,
            method: 'GET',
            param: `${mangaId}/${chapterId}.html`,
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        return parseChapterDetails($, mangaId, chapterId, response.data)
    }
}
