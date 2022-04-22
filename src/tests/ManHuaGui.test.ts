/* eslint-disable linebreak-style */
/* eslint-disable modules-newline/import-declaration-newline */
import cheerio from 'cheerio'
import { APIWrapper, Source, SearchRequest } from 'paperback-extensions-common'
import { ManHuaGui } from '../ManHuaGui/ManHuaGui'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

describe('ManHuaGui Tests', () => {
    const wrapper: APIWrapper = new APIWrapper()
    const source: Source = new ManHuaGui(cheerio)
    const expect = chai.expect
    chai.use(chaiAsPromised)

    const mangaId = '17332' // kaguya sama

    it('Retrieve Manga Details', async () => {
        const details = await wrapper.getMangaDetails(source, mangaId)
        expect(
            details,
            'No results found with test-defined ID [' + mangaId + ']'
        ).to.exist

        // Validate that the fields are filled
        const data = details
        expect(data.image, 'Missing Image').to.be.not.empty
        expect(data.status, 'Missing Status').to.exist
        expect(data.desc, 'Missing Description').to.be.not.empty
        expect(data.titles, 'Missing Titles').to.be.not.empty
        //expect(data.rating, 'Missing Rating').to.exist
    })

    it('Get Chapters', async () => {
        const data = await wrapper.getChapters(source, mangaId)

        expect(data, 'No chapters present for: [' + mangaId + ']').to.not.be
            .empty

        const entry = data[0]
        expect(entry?.id, 'No ID present').to.not.be.empty
        expect(entry?.name, 'No title available').to.not.be.empty
        expect(entry?.chapNum, 'No chapter number present').to.not.be.null
    })

    it('Get Chapter Details', async () => {
        const chapters = await wrapper.getChapters(source, mangaId)

        const data = await wrapper.getChapterDetails(
            source,
            mangaId,
            chapters[0]?.id ?? 'unknown'
        )
        expect(data, 'No server response').to.exist
        expect(data, 'Empty server response').to.not.be.empty

        expect(data.id, 'Missing ID').to.be.not.empty
        expect(data.mangaId, 'Missing MangaID').to.be.not.empty
        expect(data.pages, 'No pages present').to.be.not.empty
    })

    it('Testing search', async () => {
        const testSearch: SearchRequest = {
            title: '爱',
            parameters: {},
        }

        const search = await wrapper.searchRequest(source, testSearch, 1)
        const result = search.results[0]

        expect(result, 'No response from server').to.exist

        expect(result?.id, 'No ID found for search query').to.be.not.empty
        expect(result?.image, 'No image found for search').to.be.not.empty
        expect(result?.title, 'No title').to.be.not.null
        expect(result?.subtitleText, 'No subtitle text').to.be.not.null
    })
})
