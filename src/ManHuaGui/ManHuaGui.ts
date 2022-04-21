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
