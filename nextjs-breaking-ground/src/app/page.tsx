import Link from "next/link";

const imgRectangle10 = "https://www.figma.com/api/mcp/asset/6c59e688-e35f-4e4f-bbc2-ab33435c85c4";
const imgIcon = "https://www.figma.com/api/mcp/asset/41630572-64c1-457a-904a-0c86bee9151f";
const imgIcon1 = "https://www.figma.com/api/mcp/asset/9d000c3e-a0a0-4639-8400-25a4748f81d9";
const imgInstagramWhite = "https://www.figma.com/api/mcp/asset/65a7b66a-686d-4b22-91e9-3308c2d30d21";
const imgYoutubeWhite = "https://www.figma.com/api/mcp/asset/7dde89aa-1ea9-4ac7-84f6-fce6c9a025b5";
const imgLinkedInWhite = "https://www.figma.com/api/mcp/asset/33903285-e910-4f19-b151-3f464cad87a0";
const imgFacebookWhite = "https://www.figma.com/api/mcp/asset/cf25c62d-6db9-42f5-9fd3-94b41207389f";
const imgBg2 = "https://www.figma.com/api/mcp/asset/961e793c-d56e-4301-a43b-7c3d4b349e0e";
const imgIcon2 = "https://www.figma.com/api/mcp/asset/50ddeba7-3fb9-4535-a668-e537f61673ae";
const imgReply = "https://www.figma.com/api/mcp/asset/d8cc6c62-d443-48c3-a550-c38f9624107e";
const imgImage3 = "https://www.figma.com/api/mcp/asset/9f80ebc1-2a79-40f3-9974-4b3c4de209ad";
const imgRectangle15 = "https://www.figma.com/api/mcp/asset/4b8a2fbc-1bfb-483a-9cbd-417cf38d2823";
const imgScreenshot20260402At34113Pm1 = "https://www.figma.com/api/mcp/asset/d3db63ed-3893-4df2-9ce6-ae8d2a93560b";
const imgScreenshot20260402At34116Pm1 = "https://www.figma.com/api/mcp/asset/6cbb7f6d-92ef-4360-a3de-4640ba736f7a";
const imgScreenshot20260402At34125Pm1 = "https://www.figma.com/api/mcp/asset/9b296214-2c89-47de-b670-5479c3b66e27";
const imgScreenshot20260402At34147Pm1 = "https://www.figma.com/api/mcp/asset/d1cd9949-fc16-4efc-8ecb-ad3cea0984f1";
const imgScreenshot20260402At34120Pm1 = "https://www.figma.com/api/mcp/asset/ca867f23-f84e-49a9-989e-67f94a8a88c3";
const imgScreenshot20260402At34131Pm1 = "https://www.figma.com/api/mcp/asset/2b98f650-e0b6-4325-9a19-0f1dcfe223cb";
const imgScreenshot20260319At103148Am2 = "https://www.figma.com/api/mcp/asset/ac3eed3d-50fe-44e9-bea9-4339f21bde42";
const imgIcon6 = "https://www.figma.com/api/mcp/asset/39ced4f3-b3a9-4c67-bbe0-f0c3517c6f3a";

function TopRibbon() {
  const nav = [
    ["Region", true],
    ["Profiles", true],
    ["Features", false],
    ["Perspectives", false],
    ["Insights", true],
    ["About", true],
  ] as const;
  return (
    <div className="absolute left-0 top-0 flex w-[1440px] items-center justify-between bg-[#f5f3f0] px-[26px] pb-[28px] pt-[36px]">
      <div className="relative h-[65px] w-[266px]">
        <img src={imgBg2} alt="Breaking Ground" className="absolute inset-0 h-full w-full object-cover" />
      </div>
      <div className="flex items-center gap-[24px]">
        <div className="flex items-center gap-[28px]">
          {nav.map(([label, hasChevron]) => (
            <div key={label} className="flex items-center gap-[2px]">
              <p className="bg-type-nav whitespace-nowrap text-[#312e28]">{label}</p>
              {hasChevron ? (
                <span className="inline-flex h-[14px] w-[14px] items-center justify-center" aria-hidden="true">
                  <svg viewBox="0 0 24 24" className="h-[14px] w-[14px] text-[#312e28] opacity-80" fill="currentColor">
                    <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
                  </svg>
                </span>
              ) : null}
            </div>
          ))}
        </div>
        <div className="relative h-[36px] w-[36px]">
          <div className="absolute inset-[12.5%]">
            <img src={imgIcon} alt="Search" className="absolute inset-0 h-full w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

function LatestNews() {
  const cards = [1, 2, 3];
  return (
    <div className="absolute left-[26px] top-[611px] w-[776px]">
      <div className="flex items-center gap-[8px]">
        <img src={imgIcon6} alt="" className="h-[14px] w-[14px]" />
        <h2 className="bg-type-h2 text-[#312e28]">Latest news</h2>
      </div>
      <div className="mt-[20px] grid grid-cols-3 gap-[12px]">
        {cards.map((id) => (
          <div key={id} className="w-[250px]">
            <img src={imgRectangle10} alt="" className="h-[133px] w-[250px] rounded-[4px] object-cover" />
            <p className="bg-type-meta mt-[6px] text-[#312e28]">APRIL 15, 2026</p>
            <h3 className="bg-type-h3 text-[#312e28]">Iran Conflict Fuels Economic Concerns: Key Indicators to Watch This Week</h3>
          </div>
        ))}
      </div>
      <button className="mt-[20px] rounded-[4px] bg-[#113251] px-[12px] py-[12px] bg-font-roboto text-[12px] font-bold text-white">
        View all news
      </button>
    </div>
  );
}

function HeroFeature() {
  return (
    <div className="absolute left-[26px] top-[156px] flex h-[428px] w-[1392px] gap-[20px]">
      <img src={imgScreenshot20260319At103148Am2} alt="" className="h-[428px] w-[686px] rounded-[4px] object-cover" />
      <div className="relative flex h-[428px] w-[686px] flex-col justify-center bg-[#f5f3f0] px-[24px] pb-[42px]">
        <p className="bg-type-tag text-[#ff611d]">ARTICLE TAG</p>
        <h1 className="bg-type-h1 mt-[8px] w-[654px] text-[#312e28]">
          Profile article headline text content area placeholder
        </h1>
        <div className="mt-[10px] flex items-center gap-[12px]">
          <p className="bg-type-meta text-[#312e28]">APRIL 15, 2026</p>
          <div className="flex items-center gap-[4px]">
            <img src={imgIcon2} alt="" className="h-[12px] w-[12px]" />
            <p className="bg-type-meta text-[#312e28]">3 MIN READ</p>
          </div>
          <img src={imgReply} alt="" className="h-[14px] w-[14px]" />
        </div>
        <p className="bg-type-body mt-[20px] w-[654px] text-[#312e28]">
          Produced six times a year, BreakingGround is the first comprehensive source of local market information for all professionals of the commercial building. Produced six times a year, BreakingGround is the first comprehensive source of local market information for all professionals of the commercial building ...
        </p>
        <button className="mt-[20px] w-[156px] rounded-[4px] bg-[#113251] p-[12px] bg-font-roboto text-[12px] font-bold text-white">
          Read article
        </button>
        <div className="absolute left-[264px] top-0 flex h-[32px] items-center gap-[4px] bg-[#ff611d] p-[8px]">
          <img src={imgIcon6} alt="" className="h-[14px] w-[14px]" />
          <p className="bg-font-roboto text-[12px] font-bold tracking-[0.24px] text-white">ITEM BADGE</p>
        </div>
      </div>
    </div>
  );
}

function TabbedPanel() {
  const rows = [1, 2, 3, 4];
  return (
    <div className="absolute left-[850px] top-[631px] h-[717px] w-[566px] bg-[#f5f3f0] px-[28px] pt-[32px]">
      <div className="flex items-center gap-[12px]">
        <button className="rounded-[4px] bg-[#ff611d] px-[12px] py-[8px] bg-font-roboto text-[12px] font-bold text-white">Profiles</button>
        <button className="rounded-[4px] bg-[rgba(161,161,161,0.1)] px-[12px] py-[8px] bg-font-roboto text-[12px] font-bold text-[#595959]">Issues</button>
        <button className="rounded-[4px] bg-[rgba(161,161,161,0.1)] px-[12px] py-[8px] bg-font-roboto text-[12px] font-bold text-[#595959]">Perspectives</button>
      </div>
      <h2 className="bg-type-h2 mt-[24px] text-[#312e28]">Breaking Ground Profiles</h2>
      <div className="mt-[16px] space-y-[16px]">
        {rows.map((r) => (
          <div key={r} className="flex w-[508px] items-center gap-[13px]">
            <img src={imgRectangle10} alt="" className="h-[100px] w-[140px] rounded-[4px] object-cover" />
            <div className="w-[355px]">
              <p className="bg-type-h3 text-[#312e28]">Profile title</p>
              <p className="bg-type-body text-[#312e28]">Produced six times a year, Breaking Ground is the first comprehensive source ...</p>
            </div>
          </div>
        ))}
      </div>
      <button className="mt-[24px] w-[156px] rounded-[4px] bg-[#113251] p-[12px] bg-font-roboto text-[12px] font-bold text-white">
        View all profiles
      </button>
    </div>
  );
}

function MidAd() {
  return (
    <div className="absolute left-[26px] top-[1163px] flex h-[145px] w-[684px] items-center gap-[28px]">
      <img src={imgImage3} alt="" className="h-[145px] w-[160px] rounded-[4px] object-cover" />
      <div className="w-[480px]">
        <h2 className="bg-type-h2 text-[#312e28]">The IBEW Union Hall</h2>
        <p className="bg-type-body mt-[6px] text-[#312e28]">
          For more than a century, the International Brotherhood of Electrical Workers Local 712 has trained and supplied skilled electricians to contractors throughout Beaver, Crawford, Lawrence, and Mercer ...
        </p>
        <p className="mt-[6px] bg-font-roboto text-[14px] text-[#c85006] underline">Call to action link</p>
      </div>
    </div>
  );
}

function EventBanner() {
  return (
    <div className="absolute left-0 top-[1372px] h-[336px] w-[1440px] overflow-hidden">
      <img src={imgRectangle15} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[#113251]/70" />
      <div className="absolute left-0 top-0 h-[336px] w-[1440px] text-center text-white">
        <div className="mt-[80px]">
          <div className="mx-auto inline-flex h-[32px] items-center gap-[4px] bg-[#ff611d] p-[8px]">
            <img src={imgIcon6} alt="" className="h-[14px] w-[14px]" />
            <p className="bg-font-roboto text-[12px] font-bold tracking-[0.24px]">EVENT REGISTRATION</p>
          </div>
          <h2 className="bg-type-h1 mt-[16px] text-white">Come Join Us At the 2025 Evening of Excellence</h2>
          <h3 className="bg-type-h2 mt-[12px] text-white">Event starts 8:00 pm on 04.13.2026</h3>
          <p className="bg-type-h3 mt-[14px] text-white">Join us for an unforgettable evening of celebration, inspiration, and impact.</p>
          <p className="mt-[18px] bg-font-helvetica text-[14px] underline">Register here</p>
        </div>
      </div>
    </div>
  );
}

function SponsorsAndAd() {
  const logos = [
    imgScreenshot20260402At34113Pm1,
    imgScreenshot20260402At34116Pm1,
    imgScreenshot20260402At34125Pm1,
    imgScreenshot20260402At34147Pm1,
    imgScreenshot20260402At34120Pm1,
    imgScreenshot20260402At34131Pm1,
  ];
  return (
    <>
      <div className="absolute left-[26px] top-[1732px] h-[361px] w-[684px]">
        <div className="mt-[68px] flex h-[89px] w-[684px] items-center justify-center gap-[10px] opacity-80">
          {logos.map((src, i) => (
            <img key={i} src={src} alt="" className="h-[75px] w-[82px] object-contain" />
          ))}
        </div>
        <div className="mx-auto mt-[34px] w-[348px] text-center">
          <h2 className="bg-type-h1 text-[#312e28]">Our sponsors</h2>
          <p className="bg-type-body mt-[12px] text-[#312e28]">
            Text about how to become a sponsor or who to contact to learn more about it, <span className="underline">click here.</span>
          </p>
        </div>
      </div>
      <div className="absolute left-[730px] top-[1740px] flex h-[361px] w-[686px] items-center justify-center bg-[#d9d9d9]">
        <h2 className="bg-type-h1 text-[#adadad]">Ad space</h2>
      </div>
    </>
  );
}

function FigmaFooter() {
  const links1 = ["Local", "National", "Project profiles", "Member profiles"];
  const links2 = ["Feature", "Perspectives", "Data insights", "AI in construction"];
  const links3 = ["About Breaking Ground", "Sponsors", "Contact"];
  return (
    <footer className="absolute left-0 top-[2160px] h-[236px] w-[1440px] bg-[#312e28] px-[48px] py-[48px] text-white">
      <div className="flex items-start gap-[48px]">
        <div className="w-[373px]">
          <img src={imgBg2} alt="Breaking Ground" className="h-[58px] w-[240px] object-cover" />
          <p className="bg-font-roboto mt-[15px] text-[10px]">CONSTRUCTION • INDUSTRY • POWER • WESTERN PA</p>
        </div>
        <div className="flex w-[606px] gap-[58px] bg-font-roboto text-[14px]">
          <div className="space-y-[12px]">{links1.map((x) => <p key={x}>{x}</p>)}</div>
          <div className="space-y-[12px]">{links2.map((x) => <p key={x}>{x}</p>)}</div>
          <div className="space-y-[12px]">{links3.map((x) => <p key={x}>{x}</p>)}</div>
        </div>
        <div className="ml-auto">
          <div className="flex items-center gap-[19px]">
            <img src={imgFacebookWhite} alt="" className="h-[36px] w-[36px]" />
            <img src={imgLinkedInWhite} alt="" className="h-[36px] w-[36px]" />
            <img src={imgYoutubeWhite} alt="" className="h-[36px] w-[36px]" />
            <img src={imgInstagramWhite} alt="" className="h-[36px] w-[36px]" />
          </div>
          <p className="bg-font-helvetica mt-[14px] text-[12px]">© 2026 Breaking Ground    Privacy    Terms</p>
        </div>
      </div>
    </footer>
  );
}

export default function IndexPage() {
  return (
    <main className="figma-homepage min-h-screen bg-[#e8e8e8] py-6 overflow-x-auto">
      <div className="relative mx-auto h-[2644px] w-[1440px] bg-white">
        <TopRibbon />
        <HeroFeature />
        <LatestNews />
        <TabbedPanel />
        <MidAd />
        <EventBanner />
        <SponsorsAndAd />
        <FigmaFooter />
      </div>
    </main>
  );
}
