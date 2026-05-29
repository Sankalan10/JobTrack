import axios from 'axios';

export const parseJobUrl = async (url) => {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    const defaultCompany = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
    
    // Set a very tight timeout of 3 seconds so the user is never stuck waiting
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 3000
    });

    const html = response.data;
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    
    if (!titleMatch || !titleMatch[1]) {
      return { company: defaultCompany, role: 'Software Engineer', logoUrl: `https://www.google.com/s2/favicons?domain=${domain}&sz=64` };
    }

    const title = titleMatch[1].trim();
    let company = defaultCompany;
    let role = title;

    // Apply smart regex heuristics to extract company & role from title
    // e.g. "Software Engineer | Google Careers" or "SDE Intern at Stripe"
    const separators = [' at ', ' | ', ' - ', ' – ', ' @ '];
    for (const sep of separators) {
      if (title.toLowerCase().includes(sep)) {
        const parts = title.split(new RegExp(sep.replace('|', '\\|'), 'i'));
        
        // If the second part has words like "careers", "jobs", it usually contains the company!
        if (parts[1].toLowerCase().includes('careers') || 
            parts[1].toLowerCase().includes('jobs') || 
            parts[1].toLowerCase().includes('hiring') ||
            parts[1].toLowerCase().trim() === company.toLowerCase()) {
          role = parts[0].trim();
          company = parts[1].replace(/careers|jobs|hiring/gi, '').replace(/[|•-]/g, '').trim();
        } else {
          role = parts[0].trim();
          company = parts[1].trim();
        }
        break;
      }
    }

    // Clean up role if it contains company name
    if (role.toLowerCase().includes(company.toLowerCase())) {
      role = role.replace(new RegExp(company, 'gi'), '').replace(/\s+at\s+/gi, '').replace(/\s*-\s*/g, '').trim();
    }

    // Standardize company capitalization
    if (company.toLowerCase() === defaultCompany.toLowerCase()) {
      company = defaultCompany;
    } else {
      company = company.charAt(0).toUpperCase() + company.slice(1);
    }

    return {
      company: company || defaultCompany,
      role: role || 'Software Engineer',
      logoUrl: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    };
  } catch (error) {
    console.warn('Scraping failed or timed out, triggering URL-domain fallback:', error.message);
    
    // Failsafe Domain Fallback
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      const company = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
      return {
        company,
        role: 'Software Engineer',
        logoUrl: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
      };
    } catch (e) {
      return {
        company: 'Unknown',
        role: 'Software Engineer',
        logoUrl: ''
      };
    }
  }
};
