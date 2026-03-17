import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const server = {
  send: defineAction({
    accept: 'form',

    input: z.object({
      fullName: z.string().min(2),
      email: z.string().email(),
      channelUrl: z.string().url(),
      monthlyViews: z.enum(['500k_1m', '1m_5m', '5m_10m', '10m_plus']),
      category: z.string(),
      rights: z.enum(['yes', 'no']),
    }),

    handler: async (data) => {
      const { fullName, email, channelUrl, monthlyViews, category, rights } = data;

      const viewsMap = {
        '500k_1m': '500K – 1M',
        '1m_5m': '1M – 5M',
        '5m_10m': '5M – 10M',
        '10m_plus': '10M+',
      };

      const rightsLabel = rights === 'yes' ? 'Yes' : 'No';

      const formattedCategory = category
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      const formattedFullName = fullName
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');


      const { error } = await resend.emails.send({
        from: 'NeoGen Applications <onboarding@resend.dev>',
        to: ['test@gmail.com'],
        subject: `New NeoGen Application - ${formattedFullName}`,

        html: `
          <div style="max-width: 900px; margin:auto; font-family: Arial, sans-serif;">
            
            <header style="background:#111; color:white; padding:20px; border-radius:12px;">
              <h1 style="margin:0;">New Application Received 🚀</h1>
              <p style="margin:0; opacity:0.8;">NeoGen Program</p>
            </header>

            <div style="padding:20px;">
              
              <h2 style="color:#111;">Creator Info</h2>

              <p"><strong>Full Name:</strong> ${formattedFullName}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p>
                <strong>YouTube Channel:</strong><br/>
                <a href="${channelUrl}" target="_blank">${channelUrl}</a>
              </p>

              <hr style="margin:20px 0;" />

              <h2 style="color:#111;">Channel Details</h2>

              <p><strong>Monthly Views:</strong> ${viewsMap[monthlyViews]}</p>
              <p><strong>Category:</strong> ${formattedCategory}</p>
              <p style="text-transform: capitalize;"><strong>Owns Rights:</strong> ${rightsLabel}</p>

            </div>
          </div>
        `,
      });

      if (error) {
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: error.message,
        });
      }

      return { success: true };
    },
  }),
};