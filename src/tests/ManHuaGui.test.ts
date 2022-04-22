/* eslint-disable linebreak-style */
/* eslint-disable modules-newline/import-declaration-newline */
import cheerio from 'cheerio'
import { APIWrapper, SearchRequest, Source } from 'paperback-extensions-common'
import { ManHuaGui } from '../ManHuaGui/ManHuaGui'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

describe('ManHuaGui Tests', () => {
    const wrapper: APIWrapper = new APIWrapper()
    const source: Source = new ManHuaGui(cheerio)
    const expect = chai.expect
    chai.use(chaiAsPromised)

    const mangaId = '17332' // kaguya sama

    it('Get Chapter Details', async () => {
        const chapters = await wrapper.getChapters(source, mangaId)

        const data = await wrapper.getChapterDetails(
            source,
            mangaId,
            chapters[0]?.id ?? 'unknown'
        )
        console.log(data)
        expect(data, 'No server response').to.exist
        expect(data, 'Empty server response').to.not.be.empty

        expect(data.id, 'Missing ID').to.be.not.empty
        expect(data.mangaId, 'Missing MangaID').to.be.not.empty
        expect(data.pages, 'No pages present').to.be.not.empty
    })
})
