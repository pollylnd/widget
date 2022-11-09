const parseQueryData = (params) => {
  const data = {
    preview: 1,
    destination_id: params.destinationId,
    category_id: params.category_id,
    limit: params.count || 4,
  };
  const prm = [];
  for (let key in data) {
    if (data[key]) {
      prm.push(encodeURI(key) + '=' + encodeURI(data[key]));
    }
  }
  if (prm.length) {
    return `https://api.tripshock.com/dev_v1/activity?${prm.join('&')}`;
  }
  return `https://api.tripshock.com/dev_v1/activity`;
};

async function getActivityData(params) {
  const res = await fetch(parseQueryData(params));
  const parsedResponse = await res.json();

  let activityData = parsedResponse.items.slice(0, params.count || 4);

  if (params.destinationId && params.category_id && !activityData.length) {
    params = {
      ...params,
      category_id: undefined
    };
    return await getActivityData(params);
  }

  return activityData;
}

async function getCityData() {
  const res = await fetch(`https://api.tripshock.com/dev_v1/destination`);

  return await res.json();
}

function renderCityWidget(data, element) {
  const div = element;

  const container = document.createElement('div');

  container.classList.add('container-city');

  const titleContainer = document.createElement('span');
  titleContainer.classList.add('title-city')
  titleContainer.innerText = data.title;

  const leftBox = document.createElement('div');
  leftBox.classList.add('left-box-city');

  const rightBox = document.createElement('div');
  rightBox.classList.add('right-box-city');
  rightBox.style.backgroundImage = `url(${data.image})`;

  const descriptionContainer = document.createElement("p");
  descriptionContainer.classList.add('description-city')
  descriptionContainer.innerText = data.description;

  const button = document.createElement("a");
  button.classList.add('button-city')
  button.innerText = "Find things to do";
  button.href = data.link;
  button.target = "_blank";

  let style = document.createElement("style");
  style.textContent = styles;

  container.append(leftBox);
  container.append(rightBox);
  leftBox.append(titleContainer);
  leftBox.append(descriptionContainer);
  leftBox.append(button);
  div.append(container);
  div.appendChild(style);
}

function renderActivityWidget(data, element) {
  const div = element;
  const container = document.createElement('div');

  container.classList.add('container-activity');

  const titleContainer = document.createElement('a');
  titleContainer.classList.add('title-activity')
  titleContainer.innerText = data.title;
  titleContainer.href = data.link;
  titleContainer.target = "_blank";

  const topBox = document.createElement('div');
  topBox.classList.add('top-box-activity');
  topBox.style.backgroundImage = `url(${data.image})`;

  const bottomBox = document.createElement('div');
  bottomBox.classList.add('bottom-box-activity');

  const descriptionContainer = document.createElement("p");
  descriptionContainer.classList.add('description-activity')
  descriptionContainer.innerText = data.description;

  const duration = document.createElement("p");
  duration.classList.add('duration-activity')
  duration.innerText = "Duration: " + data.duration;

  const rating = document.createElement("p");
  rating.classList.add('rating-activity')
  rating.innerText = "Rating: " + data.rating;

  let style = document.createElement("style");
  style.textContent = styles;

  container.append(topBox);
  container.append(bottomBox);
  bottomBox.append(titleContainer);
  bottomBox.append(descriptionContainer);
  bottomBox.append(duration);
  bottomBox.append(rating);

  let containerWrapper = element.getElementById('widget-wrapper');

  if (!containerWrapper) {
    containerWrapper = document.createElement('div');
    containerWrapper.setAttribute('id', 'widget-wrapper');
    containerWrapper.style.display = "flex";
    containerWrapper.style.flexWrap = "wrap";
    div.append(containerWrapper);
  }

  containerWrapper.append(container);

  if (!div.querySelector('style')) {
    div.appendChild(style);
  }

}

async function initAffiliateScript() {
  try {
    const elements = document.querySelectorAll('div[data-ts-affiliate_id]');
    const currentScript = document.querySelector('script[data-ts-affiliate_id]');

    let responseCityData;

    if(Array.from(elements).find((item) => item.dataset.tsWidget === 'city')) {
      responseCityData = await getCityData();
    }

    const widgetsPromises = Array.from(elements).map(async (element) => {
      const currentElement = element.attachShadow({ mode: "open" })
      if (element.dataset.tsAffiliate_id !== currentScript.dataset.tsAffiliate_id) return;

      let params = {
        type: element.dataset.tsWidget,
        destinationId: element.dataset.tsDestination_id,
        affiliateId: element.dataset.tsAffiliate_id,
        count: element.dataset.tsCount,
        category_id: element.dataset.tsCategory_id
      }

      switch (params.type) {
        case 'city':
          if (!params.affiliateId || !params.destinationId) break;

          if (!responseCityData || !responseCityData.items) {
            break;
          }

          const cityData = responseCityData.items.find((item) => item.id === params.destinationId);
          const result = {
            title: cityData.name,
            description: cityData.meta.description,
            link: `https://staging-front-end.tripshock.com/attractions/${cityData.slug}?aff_id=${params.affiliateId}`,
            image: `https://staging-images.tripshock.com/destination/${cityData.id}/${cityData.slug}.webp`
          }

          renderCityWidget(result, currentElement);

          break;
        case 'activity':
          if (!params.affiliateId) break;

          const activityData = await getActivityData(params);

          if (!activityData || !activityData.length) {
            break;
          }

          activityData.map((item) => {
            const result = {
              title: item.name,
              description: item.previewDescription,
              link: `https://staging-front-end.tripshock.com/${item.url}?aff_id=${params.affiliateId}`,
              rating: item.rating,
              rateCount: item.rate_count,
              duration: item.duration,
              min_price: item.price,
              image: `https://staging-images.tripshock.com/activity/${item.id}/${item.slug}.webp`
            };

            return renderActivityWidget(result, currentElement)
          });

          break;

        default: break;
      }
    });

    console.log(widgetsPromises)

    await Promise.all(widgetsPromises);
  } catch (error) {
    console.log(error);
  }
}

initAffiliateScript();

const styles = `
  .container-city { 
    width: 600px;
    display: flex;
    font-family: system-ui;
    border: 1px solid #DDD;
    border-radius: 10px;
    margin: 20px
  }

  .title-city {
    color:cadetblue;
    font-size:22px;
    font-weight: 600;
  }

  .description-city {
    margin:30px 0;
    font-size:14px
  }

  .button-city {
    background-color: white;
    padding: 10px 15px;
    border-radius: 80px;
    border: 2px solid cadetblue;
    font-family: system-ui;
    font-weight: 500;
    font-size: 16px;
    color: cadetblue;
    text-decoration: none;
    width: max-content
  }

  .left-box-city {
    width: 250px;
    display: flex;
    flex-direction: column;
    padding: 20px
  }

  .right-box-city {
    width: 350px;
    background-size: cover;
    border-radius: 0 10px 10px 0;
  }

  .container-activity {
    width: 300px;
    display: flex;
    font-family: system-ui;
    border: 1px solid #DDD;
    flex-direction: column;
    border-radius: 10px;
    margin: 20px;
  }
  
  .title-activity {
    color:#333;
    font-size:16px;
    font-weight: 600;
    text-decoration: none;
  }
  
  .description-activity {
    margin:10px 0;
    font-size:12px
  }
  
  .bottom-box-activity {
    width: 250px;
    display: flex;
    flex-direction: column;
    padding: 20px
  }
  
  .top-box-activity {
    height: 250px;
    background-size: cover;
    border-radius: 0 10px 10px 0;
  }
  
  .duration-activity {
    font-weight: 500;
    font-size: 11px;
    color: gray
  }
  
  .rating-activity {
    font-weight: 500;
    font-size: 11px;
    color: #333
  }

`
