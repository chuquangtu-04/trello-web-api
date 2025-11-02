import { env } from '~/config/environment'

// Những domain được phép truy cập tới tài nguyên của server
export const WHITELIST_DOMAINS = [
  'https://trello-web-fullstack.vercel.app'
]
export const BOARD_TYPE = {
  'PUBLIC': 'public',
  'PRIVATE': 'private'
}

export const DEFAULT_PAGE = 1
export const DEFAULT_ITEMS_PER_PAGE = 12

export const WEBSITE_DOMAIN = (env.BUILD_MODE === 'production') ? env.WEBSITE_DOMAIN_PRODUCTION : env.WEBSITE_DOMAIN_DEVELOPMENT

export const INVITATION_TYPES = {
  BOARD_INVITATION: 'BOARD_INVITATION'
}

export const BOARD_INVITATION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
}
export const CARD_MEMBERS_ACTIONS = {
  REMOVE: 'REMOVE',
  ADD: 'ADD'
}
