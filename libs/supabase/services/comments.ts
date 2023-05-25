import type { Comment, InsertComment, UpdateComment } from '@/libs/supabase/types'
import { createServerClient } from '@/libs/supabase/server'
import BaseDbService from './BaseDbService'

export type ProductComment = Comment & { children?: Comment[] }

export default class CommentService extends BaseDbService {
  constructor(isServer: boolean) {
    super(isServer)
  }

  private _getChildren(rows: Comment[], parentId: number): ProductComment[] | undefined {
    return rows
      .filter(i => i.parent_id === parentId)
      .map(i => ({
        ...i,
        children: this._getChildren(rows, i.id),
      }))
  }

  async insert(comment: InsertComment): Promise<ProductComment | null> {
    const { data, error } = await this.supabase.from('comment').insert(comment).select().single()

    console.log(error)
    if (error !== null) throw new Error(error.message)
    return data
  }

  async getById(id: number): Promise<ProductComment | null> {
    const { data, error } = await this.supabase.from('comment').select().or(`id.eq.${id},parent_id.eq.${id}`)

    if (error !== null) throw new Error(error.message)
    const comment = data.find(i => i.id === id)
    if (comment === undefined) return null

    return {
      ...comment,
      children: this._getChildren(data, id),
    }
  }

  async getByProductId(productId: number): Promise<ProductComment[] | null> {
    const { data, error } = await this.supabase
      .from('comment')
      .select('*, users ( profiles (full_name, avatar_url ) )')
      .eq('product_id', productId)
      // .eq('deleted', false)
      .order('created_at')

    if (error !== null) throw new Error(error.message)

    return data
      .filter(i => i.parent_id === null)
      .map(i => ({
        ...i,
        children: this._getChildren(data, i.id),
      }))
  }

  async update(id: number, updates: UpdateComment): Promise<Comment> {
    const { data, error } = await this.supabase.from('comment').update(updates).eq('id', id).single()

    if (error != null) throw new Error(error.message)
    return data
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.supabase.from('comment').update({ deleted: true }).eq('id', id)

    if (error !== null) throw new Error(error.message)
  }

  async upvote(commentId: number, userId: string): Promise<boolean> {
    const supabase = createServerClient()
    const { data, error } = await supabase.rpc('upvoteComment', { _comment_id: commentId, _user_id: userId })
    if (error !== null) throw new Error(error.message)
    return data
  }
}