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
  container.setAttribute('id', 'container');

  const titleContainer = document.createElement('span');
  titleContainer.classList.add('title-city')
  titleContainer.innerText = data.title;

  const leftBox = document.createElement('div');
  leftBox.classList.add('info-box-city');

  const rightBox = document.createElement('div');
  rightBox.classList.add('image-box-city');
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

  const parentWidth = container.clientWidth;

  if(parentWidth > 700) {
    container.style.height = "268px";
    container.style.flexDirection = "row-reverse";
    rightBox.style.width = "100%";
    rightBox.style.height = "256px";
    leftBox.style.paddingTop = "18px";
  }

  if(parentWidth > 1200) {
    container.style.height = "288px";
    container.style.flexDirection = "row-reverse";
    rightBox.style.width = "100%";
    rightBox.style.height = "276px";
    // leftBox.style.paddingTop = "18px";
  }
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

  const priceBox = document.createElement('div');
  priceBox.classList.add('price-box')
  priceBox.innerText = "$";
  const minPrice = document.createElement('div');
  minPrice.innerText = data.price;
  minPrice.style.fontSize = "15px";
  minPrice.style.marginBottom = "2px";
  priceBox.append(minPrice);
  topBox.append(priceBox)

  const bottomBox = document.createElement('div');
  bottomBox.classList.add('bottom-box-activity');

  const descriptionContainer = document.createElement("p");
  descriptionContainer.classList.add('description-activity')
  descriptionContainer.innerText = data.description;

  const ratingContainer = document.createElement("div");
  ratingContainer.classList.add('rating-activity-container')
  const ratingCountContainer = document.createElement('p');
  ratingCountContainer.classList.add('rating-activity');

  ratingCountContainer.innerText = data.rateCount + " ratings";

  const fullRatingCount = data.rating_stars.full;

  const fullfilledStar = document.createElement('div');
  fullfilledStar.innerHTML = starFilledIcon;
  fullfilledStar.classList.add('filled-icon');

  const halffilledStar = document.createElement('div');
  halffilledStar.innerHTML = halfFilledIcon;
  halffilledStar.classList.add('half-filled-icon');

  const emptyStar = document.createElement('div');
  emptyStar.innerHTML = starEmptyIcon;
  emptyStar.classList.add('empty-icon');

  const rateStars = document.createElement('div');
  rateStars.style.display = 'flex';
  rateStars.style.flexDirection = 'row';
  const emptyStarsCount = 5 - fullRatingCount - data.rating_stars.half;

  for (let i = 0; i < fullRatingCount; i++) {
    rateStars.append(fullfilledStar.cloneNode(true))
  }

  if (data.rating_stars.half) {
    rateStars.append(halffilledStar)
  }

  for (let i = 0; i < emptyStarsCount; i++) {
    rateStars.append(emptyStar.cloneNode(true))
  }

  ratingContainer.append(rateStars);
  ratingContainer.append(ratingCountContainer);

  let style = document.createElement("style");
  style.textContent = styles;

  container.append(topBox);
  container.append(bottomBox);
  bottomBox.append(titleContainer);
  bottomBox.append(ratingContainer);
  bottomBox.append(descriptionContainer);

  let containerWrapper = element.getElementById('widget-wrapper');

  if (!containerWrapper) {
    containerWrapper = document.createElement('div');
    containerWrapper.setAttribute('id', 'widget-wrapper');
    containerWrapper.classList.add('wrapper')
    div.append(containerWrapper);
  }

  containerWrapper.append(container);

  const parentWidth = containerWrapper.offsetWidth;
  if (parentWidth < 560) {
    containerWrapper.style.gridTemplateColumns = "1fr";
    container.style.maxWidth = "560px"
  }
  if (parentWidth > 560) {
    containerWrapper.style.gridTemplateColumns = "repeat(2, 1fr)";
    container.style.maxWidth = "417px"
  }
  if (parentWidth > 846) {
    containerWrapper.style.gridTemplateColumns = "repeat(3, 1fr)";
    container.style.maxWidth = "369px"
  }
  if (parentWidth > 1132) {
    containerWrapper.style.gridTemplateColumns = "repeat(4, 1fr)";
    container.style.maxWidth = "560px"
  }

  if (!div.querySelector('style')) {
    div.appendChild(style);
  }

}

async function initAffiliateScript() {
  try {
    const elements = document.querySelectorAll('div[data-ts-affiliate_id]');
    const currentScript = document.querySelector('script[data-ts-affiliate_id]');

    const itemsForRender = [];

    const widgetsPromises = Array.from(elements).map(async (element) => {
      const currentElement = element.attachShadow({ mode: "open" })
      if (element.dataset.tsAffiliate_id !== currentScript.dataset.tsAffiliate_id) return;

      let responseCityData;

      if (Array.from(elements).find((item) => item.dataset.tsWidget === 'city')) {
        responseCityData = await getCityData();
      }

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
          };

          itemsForRender.push({
            data: result,
            type: params.type,
            element: currentElement,
          })

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
              price: item.price,
              image: `https://staging-images.tripshock.com/activity/${item.id}/${item.slug}.webp`,
              rating_stars: item.rating_stars,

            };

            return itemsForRender.push({
              data: result,
              type: params.type,
              element: currentElement,
            })
          });

          break;

        default: break;
      }
    });

    await Promise.all(widgetsPromises);

    itemsForRender.map((item) => {
      if (item.type === "city") {
        return renderCityWidget(item.data, item.element)
      }
      if (item.type === "activity") {
        return renderActivityWidget(item.data, item.element)
      }
      return null
    })

  } catch (error) {
    console.log(error);
  }
}

initAffiliateScript();

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap');

  .wrapper {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    grid-column-gap: 0px;
    grid-row-gap: 0px;
  }

  .container-city { 
    display: flex;
    font-family: 'Montserrat', sans-serif;
    background: #FFFFFF;
    box-shadow: 0px 3.89312px 18.36px rgba(114, 117, 123, 0.2);
    border-radius: 15px;
    margin: 20px;
    padding-bottom: 12px;
    flex-direction: column-reverse;
    min-width: 274px;
    height: 450px;
    max-width: 1600px;
  }

  .title-city {
    font-size:20px;
    font-weight: 600;
    color:#333;
  }

  .description-city {
    margin:8px 0;
    font-size: 14px;
    font-weight: 400;
    color: #6C6B6B;
  }

  .button-city {
    background-color: white;
    padding: 14px 0px;
    font-family: system-ui;
    font-weight: 500;
    font-size: 16px;
    background: linear-gradient(90deg, #03D9B1 0%, #1CBBD9 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-decoration: none;
    min-width: 226px;
    max-width: 250px;
    position: relative;
    text-align: center;
    margin-top: 10px
  }

  .button-city::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50px; 
    border: 1px solid transparent;
    background: linear-gradient(90deg, #03D9B1 0%, #1CBBD9 100%);
    -webkit-mask:
      linear-gradient(#fff 0 0) padding-box, 
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: destination-out;
    mask-composite: exclude;
  }

  .info-box-city {
    display: flex;
    flex-direction: column;
    padding: 2px 24px 12px 24px
  }

  .image-box-city {
    background-size: cover;
    height: 100%;
    border-radius: 11.6766px;
    margin: 12px
  }

  .container-activity {
    min-width: 274px;
    display: flex;
    font-family: 'Montserrat', sans-serif;
    flex-direction: column;
    border-radius: 15px;
    margin: 6px;
    box-shadow: 0px 3.89312px 18.36px rgba(114, 117, 123, 0.2);
  }
  
  .title-activity {
    color:#333;
    font-size:16px;
    font-weight: 600;
    text-decoration: none;
    height: 66px
  }
  
  .description-activity {
    margin:12px 0;
    font-size:12px;
    font-weight: 400;
    color: #6C6B6B;
    font-family: 400
  }
  
  .bottom-box-activity {
    display: flex;
    flex-direction: column;
    padding: 2px 24px 12px 24px
  }
  
  .top-box-activity {
    height: 177px;
    background-size: cover;
    border-radius: 11.6766px;
    margin: 12px
  }

  .rating-activity-container {
    display: flex;
    align-items: center;
    margin-top: 5px;
  }
    
  .rating-activity {
    font-weight: 400;
    font-size: 12px;
    color: #6C6B6B;
    margin: 0 0 0 4px;
  }

  .filled-icon {
    margin-right: 2.5px
  }

  .empty-icon {
    margin-right: 2.5px
  }

  .price-box {
    background: #FFFFFF;
    box-shadow: 0px 20px 13px rgba(17, 15, 15, 0.05), 0px 8.14815px 6.51852px rgba(17, 15, 15, 0.0392593);
    border-radius: 38.9222px;
    font-weight: 600;
    font-size: 12px;
    color: #333333;
    width: 66px;
    margin: 12px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 2px;
  }

`

const starEmptyIcon = `<svg width="10" height="11" viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2.53935 10.3365C2.40889 10.3365 2.2132 10.2672 2.08274 10.198C1.82182 9.99022 1.69136 9.7132 1.75659 9.36692L2.14797 6.80449L0.386775 5.00386C0.191087 4.72684 0.125858 4.44982 0.191087 4.10354C0.256316 3.75727 0.517234 3.5495 0.843381 3.5495L3.25687 3.20323L4.36577 0.848555C4.49623 0.571535 4.82237 0.36377 5.08329 0.36377C5.40944 0.36377 5.67036 0.571535 5.80082 0.848555L6.90971 3.20323L9.3232 3.5495C9.64935 3.61876 9.84504 3.82652 9.9755 4.10354C10.0407 4.38056 9.9755 4.72684 9.77981 4.9346L8.01862 6.80449L8.40999 9.36692C8.47522 9.7132 8.34476 9.99022 8.08384 10.198C7.82293 10.4057 7.49678 10.4057 7.23586 10.2672L5.01806 9.02065L2.80026 10.2672C2.80026 10.2672 2.6698 10.3365 2.53935 10.3365ZM5.08329 8.05108C5.21375 8.05108 5.34421 8.05108 5.47467 8.12033L7.49678 9.22841L7.1054 6.87374C7.04017 6.59672 7.17063 6.3197 7.30109 6.11194L8.93183 4.44982L6.71403 4.10354C6.45311 4.03429 6.25742 3.89578 6.12696 3.61876L5.14852 1.47185L4.10485 3.68801C3.97439 3.96503 3.7787 4.10354 3.51779 4.1728L1.29999 4.51907L2.93072 6.18119C3.12641 6.38896 3.19164 6.66598 3.12641 6.943L2.73503 9.29767L4.75714 8.18959C4.82237 8.05108 4.95283 8.05108 5.08329 8.05108Z" fill="#F2B718"/>
</svg>`;

const starFilledIcon = `<svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.0495 4.10354C9.9842 3.82652 9.7229 3.5495 9.39628 3.5495L6.97926 3.20323L5.86874 0.848555C5.73809 0.571535 5.47679 0.36377 5.21549 0.36377C4.88886 0.36377 4.62756 0.571535 4.49691 0.848555L3.38639 3.20323L0.969372 3.5495C0.642747 3.61876 0.446773 3.82652 0.316123 4.10354C0.250798 4.38056 0.316122 4.72684 0.512097 4.9346L2.27587 6.73523L1.88392 9.36692C1.81859 9.7132 1.94924 9.99022 2.21054 10.198C2.47184 10.4057 2.79847 10.4057 3.05977 10.2672L5.28081 9.02065L7.50186 10.2672C7.63251 10.3365 7.76316 10.3365 7.89381 10.3365C8.02446 10.3365 8.22043 10.2672 8.35108 10.198C8.61238 9.99022 8.74303 9.7132 8.67771 9.36692L8.28576 6.80449L10.0495 5.00386C10.1149 4.72684 10.1802 4.44982 10.0495 4.10354Z" fill="#F2B718"/>
</svg>`;

const halfFilledIcon = `<svg width="10" height="11" viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2.53922 10.3365C2.40876 10.3365 2.21308 10.2672 2.08262 10.198C1.8217 9.99022 1.69124 9.7132 1.75647 9.36692L2.14785 6.80449L0.386653 5.00386C0.190964 4.72684 0.125736 4.44982 0.190965 4.10354C0.256194 3.75727 0.517112 3.5495 0.843259 3.5495L3.25675 3.20323L4.36565 0.848555C4.4961 0.571535 4.82225 0.36377 5.08317 0.36377C5.40932 0.36377 5.67023 0.571535 5.80069 0.848555L6.90959 3.20323L9.32308 3.5495C9.64923 3.61876 9.84492 3.82652 9.97538 4.10354C10.0406 4.38056 9.97538 4.72684 9.77969 4.9346L8.01849 6.80449L8.40987 9.36692C8.4751 9.7132 8.34464 9.99022 8.08372 10.198C7.8228 10.4057 7.49666 10.4057 7.23574 10.2672L5.01794 9.02065L2.80014 10.2672C2.80014 10.2672 2.66968 10.3365 2.53922 10.3365ZM5.08317 8.05108C5.21363 8.05108 5.34409 8.05108 5.47455 8.12033L7.49666 9.22841L7.10528 6.87374C7.04005 6.59672 7.17051 6.3197 7.30097 6.11194L8.93171 4.44982L6.7139 4.10354C6.45299 4.03429 6.2573 3.89578 6.12684 3.61876L5.1484 1.47185L4.10473 3.68801C3.97427 3.96503 3.77858 4.10354 3.51766 4.1728L1.29987 4.51907L2.9306 6.18119C3.12629 6.38896 3.19152 6.66598 3.12629 6.943L2.73491 9.29767L4.75702 8.18959C4.82225 8.05108 4.95271 8.05108 5.08317 8.05108Z" fill="#F2B718"/>
<path d="M5.08317 0.36377C4.75702 0.36377 4.49611 0.571535 4.36565 0.848555L3.25675 3.20323L0.843259 3.5495C0.517112 3.61876 0.321424 3.82652 0.190965 4.10354C0.125736 4.38056 0.190965 4.72684 0.386653 4.9346L2.14785 6.80449L1.75647 9.36692C1.69124 9.7132 1.8217 9.99022 2.08262 10.198C2.34354 10.4057 2.66968 10.4057 2.9306 10.2672L5.1484 9.02065V0.36377H5.08317Z" fill="#F2B718"/>
</svg>
`
