// VortexFlow Labs Quote API
// Deployed on Vercel Serverless

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// CORS headers for Flutter Flow
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).json(corsHeaders);
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      serviceType, 
      projectStage, 
      complexity, 
      timeline,
      name,
      email,
      company,
      description 
    } = req.body;

    // Validate required fields
    if (!serviceType || !complexity || !timeline || !name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Calculate estimate
    const estimate = calculateEstimate(serviceType, complexity, timeline);
    const quoteId = `VFL-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Prepare lead data
    const leadData = {
      quoteId,
      serviceType,
      projectStage: projectStage || 'concept',
      complexity,
      timeline,
      name,
      email,
      company: company || 'N/A',
      description: description || 'N/A',
      estimate: estimate.range,
      timelineWeeks: estimate.timeline,
      deliverables: estimate.deliverables,
      createdAt: new Date().toISOString()
    };

    // Send admin notification email
    try {
      await resend.emails.send({
        from: 'VortexFlow Labs <quotes@vortexflowlabs.com>',
        to: 'contact@vortexflowlabs.com',
        subject: `🚀 New Quote: ${leadData.company} - ${estimate.range}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="color: #FF6B35;">New Quote Request</h2>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Lead Information</h3>
              <p><strong>Name:</strong> ${leadData.name}</p>
              <p><strong>Email:</strong> ${leadData.email}</p>
              <p><strong>Company:</strong> ${leadData.company}</p>
              <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Project Details</h3>
              <p><strong>Service:</strong> ${leadData.serviceType.toUpperCase()}</p>
              <p><strong>Stage:</strong> ${leadData.projectStage}</p>
              <p><strong>Complexity:</strong> ${leadData.complexity}</p>
              <p><strong>Timeline:</strong> ${leadData.timeline}</p>
              <p><strong>Description:</strong> ${leadData.description}</p>
            </div>

            <div style="background: #FF6B35; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Estimate</h3>
              <p style="font-size: 24px; font-weight: bold; margin: 10px 0;">${estimate.range}</p>
              <p><strong>Timeline:</strong> ${estimate.timeline} weeks</p>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Admin email failed:', emailError);
    }

    // Send customer confirmation email
    try {
      await resend.emails.send({
        from: 'VortexFlow Labs <quotes@vortexflowlabs.com>',
        to: email,
        subject: 'Your Hardware Development Estimate - VortexFlow Labs',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; color: #333;">
            <div style="text-align: center; padding: 30px 0; border-bottom: 3px solid #FF6B35;">
              <h1 style="color: #0A0A0F; margin: 0;">VORTEXFLOW LABS</h1>
              <p style="color: #666; margin: 10px 0 0 0;">Studio-built | Mission Aligned Engineering</p>
            </div>

            <div style="padding: 30px 20px;">
              <h2 style="color: #0A0A0F;">Hi ${name},</h2>
              
              <p>Thank you for your interest in VortexFlow Labs. Based on your project requirements, 
              we've prepared a preliminary estimate for your <strong>${serviceType.toUpperCase()}</strong> project.</p>

              <div style="background: #0A0A0F; color: white; padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0;">
                <p style="margin: 0 0 10px 0; color: #FF6B35; font-weight: 600;">ESTIMATED INVESTMENT</p>
                <p style="font-size: 36px; font-weight: 800; margin: 0; color: #FF6B35;">${estimate.range}</p>
                <p style="margin: 15px 0 0 0; color: #ccc;">Timeline: ${estimate.timeline} weeks</p>
              </div>

              <div style="background: #f9f9f9; padding: 25px; border-radius: 8px; margin: 30px 0;">
                <h3 style="color: #0A0A0F; margin-top: 0;">What's Included:</h3>
                <ul style="padding-left: 20px;">
                  ${estimate.deliverables.map(d => `<li style="margin: 8px 0;">${d}</li>`).join('')}
                </ul>
              </div>

              <div style="margin: 30px 0;">
                <h3 style="color: #0A0A0F;">Next Steps:</h3>
                <ol style="padding-left: 20px;">
                  ${estimate.nextSteps.map(step => `<li style="margin: 10px 0;">${step}</li>`).join('')}
                </ol>
              </div>

              <div style="text-align: center; margin: 40px 0;">
                <a href="https://calendly.com/vortexflowlabs" 
                   style="background: #FF6B35; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                  Schedule Discovery Call
                </a>
              </div>

              <p style="color: #666; font-size: 14px; line-height: 1.6;">
                <strong>Questions?</strong> Reply to this email or call us. 
                This estimate is valid for 30 days and may be refined after our technical discovery call.
              </p>
            </div>

            <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999;">
              <p>VortexFlow Labs | Bangalore, India</p>
              <p><a href="https://www.vortexflowlabs.com" style="color: #FF6B35;">www.vortexflowlabs.com</a></p>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Customer email failed:', emailError);
    }

    // Return success response
    return res.status(201).json({
      success: true,
      quoteId,
      estimate: {
        range: estimate.range,
        timeline: estimate.timeline,
        deliverables: estimate.deliverables
      },
      nextSteps: estimate.nextSteps
    });

  } catch (error) {
    console.error('Quote error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process quote request'
    });
  }
}

// Pricing Engine
function calculateEstimate(serviceType, complexity, timeline) {
  const basePrices = {
    mvp: 5.0,
    consulting: 1.0,
    retainer: 1.0,
    oem: 8.0
  };

  const complexityMultipliers = {
    simple: 0.8,
    medium: 1.0,
    complex: 1.5,
    advanced: 2.2
  };

  const timelineMultipliers = {
    urgent: 1.3,
    standard: 1.0,
    relaxed: 0.9
  };

  const base = basePrices[serviceType] || 5.0;
  const complexityMult = complexityMultipliers[complexity] || 1.0;
  const timelineMult = timelineMultipliers[timeline] || 1.0;

  const total = base * complexityMult * timelineMult;
  const min = Math.round(total * 10) / 10;
  const max = Math.round(total * 1.3 * 10) / 10;

  const timelines = {
    mvp: { urgent: '6-8', standard: '10-12', relaxed: '14-16' },
    consulting: { urgent: '1-2', standard: '2-4', relaxed: '4-6' },
    retainer: { urgent: 'Monthly', standard: 'Monthly', relaxed: 'Monthly' },
    oem: { urgent: '8-10', standard: '12-16', relaxed: '20-24' }
  };

  const deliverables = {
    mvp: [
      'Complete Electronics System Design',
      '4-Layer PCB Layout & Fabrication',
      'Embedded Firmware (ESP32/STM32)',
      '3D Enclosure Design & 3D Printing',
      '3 Functional Prototypes',
      'Manufacturing Documentation'
    ],
    consulting: [
      'System Architecture Design',
      'Component Selection & BOM Optimization',
      'Design Review & Risk Analysis',
      'Manufacturing Feasibility Study',
      'Technical Documentation'
    ],
    retainer: [
      '40 Hours Dedicated Engineering/Month',
      'Priority Support (24h Response)',
      'Iterative Design Refinement',
      'Manufacturing Liaison'
    ],
    oem: [
      'Custom Electronics Engineering',
      'Industrial Controller Design',
      'IoT Gateway Development',
      'White-Label Manufacturing Support'
    ]
  };

  const nextSteps = {
    mvp: [
      'Schedule technical discovery call',
      'Review system architecture',
      'Finalize component BOM',
      'Sign project agreement'
    ],
    consulting: [
      'Schedule architecture review',
      'Share existing design documents',
      'Receive assessment report'
    ],
    retainer: [
      'Define monthly engineering priorities',
      'Setup dedicated Slack channel',
      'Schedule weekly sync meetings'
    ],
    oem: [
      'Schedule technical requirements workshop',
      'Review compliance and certification needs',
      'Define manufacturing partnership terms'
    ]
  };

  return {
    range: `₹${min}L - ₹${max}L`,
    min,
    max,
    timeline: timelines[serviceType]?.[timeline] || '10-12',
    deliverables: deliverables[serviceType] || deliverables.mvp,
    nextSteps: nextSteps[serviceType] || nextSteps.mvp
  };
}
