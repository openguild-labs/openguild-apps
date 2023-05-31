import Logo from '@/components/ui/ToolCard/Tool.Logo'
import Name from '@/components/ui/ToolCard/Tool.Name'
import Tags from '@/components/ui/ToolCard/Tool.Tags'
import Title from '@/components/ui/ToolCard/Tool.Title'
import Votes from '@/components/ui/ToolCard/Tool.Votes'
import ToolCard from '@/components/ui/ToolCard/ToolCard'

import ProfileService from '@/utils/supabase/services/profile'
import ProductsService from '@/utils/supabase/services/products'
import UserProfileInfo from '@/components/ui/UserProfileInfo/UserProfileInfo'
import { Comment as CommentType, Product, Profile } from '@/utils/supabase/types'
import Page404 from '@/components/ui/Page404/Page404'
import ToolCardList, { ITool } from '@/components/ui/ToolCardList/ToolCardList'
import {
  Comment,
  CommentContext,
  CommentDate,
  CommentUserAvatar,
  CommentUserName,
  Comments,
} from '@/components/ui/Comment'
import { createBrowserClient } from '@/utils/supabase/browser'
import moment from 'moment'
import Link from 'next/link'

interface IComment extends CommentType {
  profiles: Profile
  products: Product
}

export default async ({ params: { user } }: { params: { user: string } }) => {
  const username = decodeURIComponent(user).slice(1)
  const profileService = new ProfileService(createBrowserClient())
  const profile = await profileService.getByUsername(username)

  if (profile) {
    const tools = await new ProductsService(createBrowserClient()).getUserProductsById(
      profile?.id as string,
      'votes_count',
      false
    )

    const activity = await profileService.getUserActivityById(profile?.id as string)

    return (
      <div className="container-custom-screen mt-10 mb-32 space-y-10">
        <UserProfileInfo profile={profile as Profile} />
        {tools && tools?.length > 0 ? (
          <div>
            <h3 className="font-medium text-slate-50">Launches</h3>
            <ul className="mt-3 divide-y divide-slate-800/60">
              {tools.map((tool, idx) => (
                <ToolCardList key={idx} tool={tool as ITool} />
              ))}
            </ul>
          </div>
        ) : (
          ''
        )}
        {activity && activity?.length > 0 ? (
          <div>
            <h3 className="font-medium text-slate-50">Activity</h3>
            <Comments className="mt-8">
              {(activity as IComment[]).map((item: IComment, idx) => (
                <Comment key={idx} className="gap-4 sm:gap-6">
                  <CommentUserAvatar src={item.profiles.avatar_url as string} />
                  <div className="flex-1">
                    <Link href={`/tool/${item.products.slug}/#${item.id}`} className="flex-1">
                      <CommentUserName>{item.profiles.full_name}</CommentUserName>
                      <CommentDate className="mt-1">Commented {moment(item.created_at).format('LL')}</CommentDate>
                      <CommentContext className="mt-3 text-slate-400 line-clamp-2">{item.content}</CommentContext>
                    </Link>
                    <ToolCard className="mt-3 border border-slate-800" href={'/tool/' + item.products.slug}>
                      <Logo src={item.products.logo_url || ''} alt={item.products.name} imgClassName="w-14 h-14" />
                      <div className="space-y-1">
                        <Name>{item.products.name}</Name>
                        <Title className="line-clamp-1 text-sm sm:line-clamp-2">{item.products.slogan}</Title>
                      </div>
                      <div className="flex-1 self-center flex justify-end">
                        <Votes count={item.products.votes_count} />
                      </div>
                    </ToolCard>
                  </div>
                </Comment>
              ))}
            </Comments>
          </div>
        ) : (
          ''
        )}
      </div>
    )
  } else return <Page404 />
}