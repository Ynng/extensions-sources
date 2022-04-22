/* eslint-disable linebreak-style */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    Source,
    Manga,
    Chapter,
    ChapterDetails,
    SearchRequest,
    PagedResults,
    SourceInfo,
    ContentRating,
    Request,
    Response,
    HomeSection,
} from 'paperback-extensions-common'
import {
    parseMangaDetails,
    parseChapters,
    parseChapterDetails,
    parseSearch,
    isLastPage,
    parseHomeSections,
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
            url: `${MHG_DOMAIN}/comic/${mangaId}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        return parseMangaDetails($, mangaId)
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = createRequestObject({
            url: `${MHG_DOMAIN}/comic/${mangaId}`,
            method: 'GET',
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
            url: `${MHG_DOMAIN}/comic/${mangaId}/${chapterId}.html`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        return parseChapterDetails($, mangaId, chapterId, response.data)
    }

    async getSearchResults(
        query: SearchRequest,
        metadata: any
    ): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1

        const request = createRequestObject({
            url: `${MHG_DOMAIN}/s/${encodeURI(
                query.title ?? ''
            )}_p${page}.html`,
            // url: 'https://www.manhuagui.com/s/%E9%83%BD%E6%98%AF_p1.html',
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        const manga = parseSearch($)
        metadata = !isLastPage($) ? { page: page + 1 } : undefined

        return createPagedResults({
            results: manga,
            metadata,
        })
    }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void>  {
        
        const request = createRequestObject({
            url: MHG_DOMAIN,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        parseHomeSections($, sectionCallback)
    }
}
