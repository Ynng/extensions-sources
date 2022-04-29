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
} from './dmzjParser'

const DMZJ_URL = 'https://www.dmzj.com'

const extractComicIdFromMangaUrlRegex = /(\d+)\.(json|html)/


export const dmzjInfo: SourceInfo = {
    version: '1.0.0',
    name: 'dmzj (动漫之家)',
    icon: 'favicon.png',
    author: 'Ynng',
    description: 'Extension that pulls manga from dmzy',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: DMZJ_URL,
    authorWebsite: 'https://github.com/Ynng',
    language: 'zh-CN',
    sourceTags: [],
}

export class dmzj extends Source {
    requestManager = createRequestManager({
        requestsPerSecond: 5,
        requestTimeout: 20000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {
                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        referer: DMZJ_URL,
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
        return `${DMZJ_URL}/info/${mangaId}.html`
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

}
