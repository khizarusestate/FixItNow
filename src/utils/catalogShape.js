/** Normalize /public/services payload into categories + services map. */
export function shapeServiceCatalog(response) {
  const payload = response?.data || {};
  const categoryList = Array.isArray(payload.categories) ? payload.categories : [];
  const allServices = Array.isArray(payload.services) ? payload.services : [];

  const servicesData = {};
  for (const cat of categoryList) {
    servicesData[cat] = [];
  }
  for (const s of allServices) {
    const cat = s?.category;
    if (!cat) continue;
    if (!servicesData[cat]) servicesData[cat] = [];
    servicesData[cat].push(s);
  }

  return { categories: categoryList, services: servicesData };
}
