import { describe, expect, it } from "vitest";
import { parseVodafoneCampaignHtml } from "./vodafone-scraper";

describe("parseVodafoneCampaignHtml", () => {
  it("extracts cmp-card campaigns, badges, images and tags accurately", () => {
    const sampleHtml = `
      <div class="widget widget_Campaign_CampaignList">
        <div class="cmp-filter-container">
          <ul class="filters">
            <li class="filter-tag active" data-tag-id="0">Tümü</li>
            <li class="filter-tag" data-tag-id="19">Yeme&amp;İçme</li>
            <li class="filter-tag" data-tag-id="32">Happy</li>
          </ul>
        </div>
        <a href="/kampanyalar/hd-iskender-indirim-firsati" class="cmp-card" data-item_id="2701084" data-tag-ids="19,32">
          <span class="card-head-label bg-green">Yeni</span>
          <div class="cmp-content">
            <div class="img-block-hover">
              <div class="img-block">
                <img class="lazyload" src="https://cms.vodafone.com.tr/static/img/content/26-11/13/_640x427_.jpg" alt="HD İskender’de %20 indirim"/>
              </div>
            </div>
            <div class="text-content"><strong>HD İskender’de %20 indirim</strong></div>
            <div class="short-description">Vodafone'lulara özel tüm menülerde geçerli indirim.</div>
          </div>
        </a>
      </div>
    `;

    const parsed = parseVodafoneCampaignHtml(sampleHtml, {
      url: "https://www.vodafone.com.tr/kampanyalar",
      categorySlug: "faturali-kampanyalar",
      categoryName: "Faturalı Kampanyalar",
    });

    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toMatchObject({
      externalId: "vdf-faturali-kampanyalar-2701084",
      title: "HD İskender’de %20 indirim",
      summary: "Vodafone'lulara özel tüm menülerde geçerli indirim.",
      imageUrl: "https://cms.vodafone.com.tr/static/img/content/26-11/13/_640x427_.jpg",
      targetUrl: "https://www.vodafone.com.tr/kampanyalar/hd-iskender-indirim-firsati",
      badgeLabel: "Yeni",
      badgeColor: "green",
      tags: ["Yeme&İçme", "Happy"],
      isFeatured: true,
    });
  });

  it("ignores empty placeholder cards without title or valid image", () => {
    const emptyHtml = `
      <a href="/kampanyalar/bos" class="cmp-card">
        <div class="cmp-content">
          <div class="img-block"><img src="https://cms.vodafone.com.tr/static/img/content/" alt=""/></div>
        </div>
      </a>
    `;

    const parsed = parseVodafoneCampaignHtml(emptyHtml, {
      url: "https://www.vodafone.com.tr/kampanyalar",
      categorySlug: "faturali-kampanyalar",
      categoryName: "Faturalı Kampanyalar",
    });

    expect(parsed).toHaveLength(0);
  });
});
