module.exports = {
  title: 'NextAuth.js',
  tagline: 'Authentication for Next.js & Serverless',
  url: 'https://next-auth.js.org',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'iaincollins',
  projectName: 'next-auth',
  themeConfig: {
    navbar: {
      title: 'NextAuth.js',
      logo: {
        alt: 'NextAuth Logo',
        src: 'img/logo/logo-flat-sm.png'
      },
      links: [
        {
          to: '/getting-started/introduction',
          activeBasePath: 'docs',
          label: 'Documentation',
          position: 'left'
        },
        {
          href: 'https://www.npmjs.com/package/next-auth/v/beta',
          label: 'npm',
          position: 'right'
        },
        {
          href: 'https://github.com/iaincollins/next-auth',
          label: 'GitHub',
          position: 'right'
        }
      ]
    },
    announcementBar: {
      id: 'release-candiate-announcement',
      content: 'NextAuth.js v2.0 is coming soon! <a target="_blank" rel="noopener noreferrer" href="https://github.com/iaincollins/next-auth/issues/196">View announcement</a>',
      backgroundColor: '#2DB2F9',
      textColor: '#fff'
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'About NextAuth.js',
          items: [
            {
              label: 'Introduction',
              to: '/getting-started/introduction'
            },
            {
              label: 'Contributors',
              to: '/contributors'
            }
          ]
        },
        {
          title: 'Download',
          items: [
            {
              label: 'GitHub',
              to: 'https://github.com/iaincollins/next-auth'
            },
            {
              label: 'NPM',
              to: 'https://www.npmjs.com/package/next-auth/v/beta'
            }
          ]
        },
        {
          title: 'Acknowledgements',
          items: [
            {
              label: 'Docusaurus v2 🦖',
              to: 'https://v2.docusaurus.io/'
            },
            {
              label: 'Images by unDraw',
              to: 'https://undraw.co/'
            }
          ]
        }
      ],
      copyright: 'NextAuth.js &copy; Iain Collins 2020'
    }
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/iaincollins/next-auth/edit/main/www'
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css')
        }
      }
    ]
  ],
  plugins: ['docusaurus-lunr-search']
}
