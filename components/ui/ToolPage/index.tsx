import { IconVote, IconChartBar, IconArrowTopRight, IconFire } from '@/components/Icons';
import ButtonUpvote from '@/components/ui/ButtonUpvote';
import { Gallery, GalleryImage } from '@/components/ui/Gallery';
import LinkShiny from '@/components/ui/LinkShiny';
import ProductLogo from '@/components/ui/ToolCard/Tool.Logo';
import { Stat, StatsWrapper, StatCountItem, StatItem } from '@/components/ui/Stats';
import { TabLink, Tabs } from '@/components/ui/TabsLink';
import { Tag, TagsGroup } from '@/components/ui/TagsGroup';
import Title from '@/components/ui/ToolCard/Tool.Title';
import ProductsService from '@/utils/supabase/services/products';
import CommentService from '@/utils/supabase/services/comments';
import CommentSection from '@/components/ui/Client/CommentSection';
import { createServerClient } from '@/utils/supabase/server';
import { createBrowserClient } from '@/utils/supabase/browser';
import AwardsService from '@/utils/supabase/services/awards';
import { type Metadata } from 'next';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import Link from 'next/link';
import ProfileService from '@/utils/supabase/services/profile';
import customDateFromNow from '@/utils/customDateFromNow';
import Page404 from '@/components/ui/Page404/Page404';
import addHttpsToUrl from '@/utils/addHttpsToUrl';
import TrendingToolsList from '@/components/ui/TrendingToolsList';
import WinnerBadge from '@/components/ui/WinnerBadge';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

export default async function ToolPage({ slug }: { slug: string }): Promise<JSX.Element> {
  // const supabaseBrowserClient = createServerClient();
  const supabaseBrowserClient = createBrowserClient();

  const productsService = new ProductsService(supabaseBrowserClient);
  const product = await productsService.getBySlug(slug, true);
  if (!product || product.deleted) return <Page404 />;

  const awardService = new AwardsService(supabaseBrowserClient);
  const commentService = new CommentService(supabaseBrowserClient);

  const owned$ = new ProfileService(supabaseBrowserClient).getById(product.owner_id as string);
  const toolAward$ = awardService.getWeeklyRank(product.id);
  const comments$ = commentService.getByProductId(product.id);

  const [owned, weekAward, comments] = await Promise.all([owned$, toolAward$, comments$]);
  const isLaunchStarted = new Date(product.launch_date).getTime() <= Date.now();
  const isLaunchEnd = new Date(product.launch_end as string).getTime() <= Date.now();

  const tabs = [
    {
      name: 'About product',
      hash: '#',
    },
    {
      name: 'Comments',
      hash: '#comments',
    },
    {
      name: 'Launch details',
      hash: '#details',
    },
    {
      name: 'Related launches',
      hash: '#launches',
    },
  ];

  const stats = [
    {
      count: product.votes_count,
      icon: <IconVote />,
      label: 'Upvotes',
    },
    {
      count: product.views_count,
      icon: <IconFire />,
      label: 'Impressions',
    },
    // TODO add calculation of rank in week and day
    // {
    //   count: `#${dayAward?.rank}`,
    //   icon: <IconChartBar />,
    //   label: 'Day rank',
    // },
    {
      count: `#${weekAward?.rank}`,
      icon: <IconChartBar />,
      label: 'Week rank',
    },
  ];

  return (
    <section className="mt-20 pb-10">
      <div className="container-custom-screen" id="about">
        <div className="flex items-center justify-between">
          <ProductLogo src={product?.logo_url} alt={product?.slogan as string} />
          <WinnerBadge weekRank={weekAward?.rank} isLaunchEnd={isLaunchEnd} />
        </div>
        <h1 className="mt-3 text-gray-100 font-medium">{product?.name}</h1>
        <Title className="mt-1">{product?.slogan}</Title>
        <div className="text-sm mt-3 flex items-center gap-x-3">
          <LinkShiny
            href={`${addHttpsToUrl(product?.demo_url as string)}?ref=levelup`}
            target="_blank"
            className="flex items-center gap-x-2">
            Live preview
            <IconArrowTopRight />
          </LinkShiny>
          <ButtonUpvote
            productId={product?.id}
            count={product?.votes_count}
            launchDate={product.launch_date}
            launchEnd={product.launch_end as string}
          />
        </div>
      </div>
      <Tabs
        ulClassName="container-custom-screen"
        className="mt-20 sticky pt-2 top-[3.75rem] z-10 bg-gray-900">
        {tabs.map((item, idx) => (
          <TabLink hash={item.hash} key={idx}>
            {item.name}
          </TabLink>
        ))}
      </Tabs>
      <div className="space-y-20">
        <div>
          <div className="relative overflow-hidden pb-12">
            <div className="absolute top-0 w-full h-[100px] opacity-40 bg-[linear-gradient(180deg,_rgba(124,_58,_237,_0.06)_0%,_rgba(72,_58,_237,_0)_100%)]"></div>
            <div className="relative container-custom-screen mt-12">
              <div
                className="prose text-gray-100 whitespace-pre-wrap"
                // Use DOMPurify method for XSS sanitizeration
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(product?.description as string),
                }}></div>
              {product?.product_categories.length ? (
                <div className="mt-6 flex flex-wrap gap-3 items-center">
                  <h3 className="text-sm text-gray-400 font-medium">Classified in</h3>
                  <TagsGroup>
                    {product?.product_categories.map((pc: { name: string }) => (
                      <Tag href={`/tools/${pc.name.toLowerCase().replaceAll(' ', '-')}`}>
                        {pc.name}
                      </Tag>
                    ))}
                  </TagsGroup>
                </div>
              ) : (
                ''
              )}
            </div>
            {product?.asset_urls?.length && (
              <div
                className={`max-w-screen-2xl ${
                  product?.asset_urls?.length === 1 ? 'container-custom-screen' : ''
                } mt-10 mx-auto sm:px-8`}>
                <Gallery
                  assets={product?.asset_urls}
                  alt={product.name}
                  src={product.demo_video_url as string}>
                  {product?.asset_urls &&
                    product?.asset_urls.map((item: string, idx: number) => (
                      <GalleryImage
                        key={idx}
                        src={item.replaceAll('&fit=max&w=750', '')}
                        alt={product.name}
                      />
                    ))}
                </Gallery>
              </div>
            )}
          </div>
        </div>
        <CommentSection
          productId={product.owner_id as string}
          comments={comments as any}
          slug={slug}
        />
        {/* Keep doing based on Product interface */}
        <div className="container-custom-screen" id="details">
          <h3 className="text-gray-50 font-medium">About this launch</h3>
          <p className="text-gray-300 mt-6">
            {product.name} {isLaunchStarted ? 'was hunted by' : 'by'}{' '}
            <Link
              href={`/@${owned?.username}`}
              className="text-green-600 hover:text-green-400 duration-150">
              {owned?.full_name}
            </Link>{' '}
            {isLaunchStarted ? 'in ' : 'Will be launched in '}
            {customDateFromNow(product.launch_date)}.
          </p>
          {isLaunchStarted ? (
            <div className="mt-10">
              <StatsWrapper>
                {stats.map((item, idx) => (
                  <Stat key={idx} className="py-4">
                    <StatCountItem>{item.count}</StatCountItem>
                    <StatItem className="mt-2">
                      {item.icon}
                      {item.label}
                    </StatItem>
                  </Stat>
                ))}
              </StatsWrapper>
            </div>
          ) : null}
        </div>
        <div className="container-custom-screen" id="launches">
          <h3 className="text-gray-50 font-medium">Trending launches</h3>
          <TrendingToolsList />
        </div>
      </div>
    </section>
  );
}
