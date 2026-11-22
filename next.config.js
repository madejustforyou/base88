/** @type {import('next').NextConfig} */
const accountHeaders = [
  {key:'Cache-Control',value:'private, no-store'},
  {key:'X-Content-Type-Options',value:'nosniff'},
  {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
  {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},
]

const nextConfig = {
  reactStrictMode:true,
  async headers(){
    return [
      {source:'/dashboard',headers:accountHeaders},
      {source:'/business-drafts/:path*',headers:accountHeaders},
      {source:'/api/business-drafts',headers:accountHeaders},
      {source:'/api/business-drafts/:path*',headers:accountHeaders},
    ]
  },
}
module.exports = nextConfig
