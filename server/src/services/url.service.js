const { db } = require('../db/knex');
const Redis = require('ioredis');

const url = process.env.SHORTEN_URL;
const redis = new Redis(); 

// Generate 8 Characters for slug
const slugGenerator = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Check if slug already exists
const slugExists = async (slug) => {
  const cached = await redis.exists(`slug:${slug}`);
  if (cached) return true;

  const existingSlug = await db('url_info').select('slug').where('slug', slug).first();
  if (existingSlug) {
    await redis.set(`slug:${slug}`, 1); 
    return true;
  }
  return false;
};

// DB Insertion
const urlInsertion = async (data) => {
  try {
    let slug = slugGenerator();

    while (await slugExists(slug)) {
      slug = slugGenerator();
    }

    await db('url_info').insert({
      slug,
      originalUrl: data.finalUrl,
      expiration: data?.expirationDate ?? null
    });

    await redis.set(
      `redirect:${slug}`,
      JSON.stringify({ originalUrl: data.finalUrl, expiration: data?.expirationDate ?? null }),
      'EX',
      60 * 60 * 24 
    );

    const shortenUrl = `${url}/${slug}`;
    return shortenUrl;

  } catch (error) {
    console.error('❌ Error during URL insertion:', error);
    throw new Error('Failed to insert URL. Please try again later.');
  }
};

// URL Checker for Redirection
const urlRedirect = async (slug) => {
  const cached = await redis.get(`redirect:${slug}`);
  let result;

  if (cached) {
    result = JSON.parse(cached);
  } else {
    result = await db('url_info')
      .select('originalUrl', 'expiration')
      .where('slug', slug)
      .first();

    if (result) {
      await redis.set(
        `redirect:${slug}`,
        JSON.stringify(result),
        'EX',
        60 * 60 * 24
      );
    }
  }

  if (!result) {
    return { status: 404, message: 'URL not found1' };
  }
  if (
    result.expiration &&
    new Date(result.expiration).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)
  ) {
    return { status: 404, message: 'URL already expired!' };
  }
  return { status: 302, redirect: result.originalUrl };
};

module.exports = {
  urlInsertion,
  urlRedirect
};
