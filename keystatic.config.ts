import { config, fields, collection, singleton } from '@keystatic/core';

export default config({
  storage: {
    kind: 'local',
  },
  singletons: {
    siteData: singleton({
      label: 'Site Data',
      path: 'src/data/siteData',
      format: { data: 'json' },
      schema: {
        site: fields.object({
          title: fields.text({ label: 'Site Title' }),
          description: fields.text({ label: 'Site Description', multiline: true }),
          brandName: fields.text({ label: 'Brand Name' }),
          brandTagline: fields.text({ label: 'Brand Tagline' }),
          copyright: fields.text({ label: 'Copyright' }),
        }),
        navigation: fields.object({
          links: fields.array(
            fields.object({
              label: fields.text({ label: 'Label' }),
              href: fields.text({ label: 'Link (href)' })
            }),
            { label: 'Navigation Links', itemLabel: props => props.fields.label.value }
          )
        }),
        hero: fields.object({
          subtitle: fields.text({ label: 'Subtitle' }),
          title: fields.text({ label: 'Title' }),
          description: fields.text({ label: 'Description', multiline: true }),
          primaryCta: fields.object({ label: fields.text({ label: 'Label' }), href: fields.text({ label: 'Link' }) }),
          secondaryCta: fields.object({ label: fields.text({ label: 'Label' }), href: fields.text({ label: 'Link' }) }),
          videoUrl: fields.text({ label: 'Video URL' }),
          videoPoster: fields.text({ label: 'Video Poster Image Path' }),
        }),
        about: fields.object({
          subtitle: fields.text({ label: 'Subtitle' }),
          title: fields.text({ label: 'Title' }),
          description: fields.text({ label: 'Description', multiline: true }),
          features: fields.array(
            fields.object({
              icon: fields.text({ label: 'FontAwesome Icon Class' }),
              title: fields.text({ label: 'Title' }),
              description: fields.text({ label: 'Description', multiline: true }),
            }),
            { label: 'Features', itemLabel: props => props.fields.title.value }
          )
        }),
        whyInvest: fields.object({
          subtitle: fields.text({ label: 'Subtitle' }),
          title: fields.text({ label: 'Title' }),
          description: fields.text({ label: 'Description', multiline: true }),
          stats: fields.array(
            fields.object({
              value: fields.text({ label: 'Value (e.g. 24)' }),
              suffix: fields.text({ label: 'Suffix (e.g. %)' }),
              prefix: fields.text({ label: 'Prefix (e.g. <)' }),
              label: fields.text({ label: 'Label' }),
            }),
            { label: 'Stats', itemLabel: props => props.fields.label.value }
          ),
          pillars: fields.array(
            fields.object({
              phase: fields.text({ label: 'Phase (e.g. 01)' }),
              title: fields.text({ label: 'Title' }),
              description: fields.text({ label: 'Description', multiline: true }),
              icon: fields.text({ label: 'Icon Class' }),
            }),
            { label: 'Pillars', itemLabel: props => props.fields.title.value }
          ),
          moatItems: fields.array(
            fields.object({
              title: fields.text({ label: 'Title' }),
              description: fields.text({ label: 'Description', multiline: true }),
              image: fields.text({ label: 'Image Path' }),
              statValue: fields.text({ label: 'Stat Value' }),
              statSuffix: fields.text({ label: 'Stat Suffix' }),
              label: fields.text({ label: 'Label' }),
              icon: fields.text({ label: 'Icon Class' }),
              style: fields.text({ label: 'Style (e.g. dark, gold, dark-wide)' }),
            }),
            { label: 'Moat Items', itemLabel: props => props.fields.title.value || props.fields.label.value }
          )
        }),
        faq: fields.object({
          subtitle: fields.text({ label: 'Subtitle' }),
          title: fields.text({ label: 'Title' }),
          description: fields.text({ label: 'Description', multiline: true }),
          items: fields.array(
            fields.object({
              question: fields.text({ label: 'Question' }),
              answer: fields.text({ label: 'Answer', multiline: true }),
            }),
            { label: 'FAQ Items', itemLabel: props => props.fields.question.value }
          )
        }),
        contact: fields.object({
          subtitle: fields.text({ label: 'Subtitle' }),
          title: fields.text({ label: 'Title' }),
          description: fields.text({ label: 'Description', multiline: true }),
          allocationOptions: fields.array(
            fields.object({
              value: fields.text({ label: 'Value' }),
              label: fields.text({ label: 'Label' }),
            }),
            { label: 'Allocation Options', itemLabel: props => props.fields.label.value }
          )
        }),
        locations: fields.object({
          subtitle: fields.text({ label: 'Subtitle' }),
          title: fields.text({ label: 'Title' }),
          description: fields.text({ label: 'Description', multiline: true }),
          offices: fields.array(
            fields.object({
              city: fields.text({ label: 'City' }),
              address: fields.text({ label: 'Address' }),
              region: fields.text({ label: 'Region' }),
              phone: fields.text({ label: 'Phone' }),
              email: fields.text({ label: 'Email' }),
              mapEmbed: fields.text({ label: 'Google Maps Embed Link', multiline: true }),
            }),
            { label: 'Offices', itemLabel: props => props.fields.city.value }
          )
        }),
        footer: fields.object({
          tagline: fields.text({ label: 'Tagline' }),
          columns: fields.array(
            fields.object({
              title: fields.text({ label: 'Column Title' }),
              links: fields.array(
                fields.object({
                  label: fields.text({ label: 'Label' }),
                  href: fields.text({ label: 'Link' }),
                }),
                { label: 'Links', itemLabel: props => props.fields.label.value }
              )
            }),
            { label: 'Columns', itemLabel: props => props.fields.title.value }
          ),
          socials: fields.array(
            fields.object({
              icon: fields.text({ label: 'Icon Class' }),
              href: fields.text({ label: 'Link' }),
            }),
            { label: 'Socials', itemLabel: props => props.fields.icon.value }
          )
        })
      },
    }),
  },
});
