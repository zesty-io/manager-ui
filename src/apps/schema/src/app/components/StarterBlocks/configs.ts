import {
  ContentModelFieldDataType,
  FieldSettings,
} from "../../../../../../shell/services/types";

type StarterBlockFieldProps = {
  label: string;
  name: string;
  description: string;
  datatype: ContentModelFieldDataType;
  settings: Partial<FieldSettings>;
};

type StarterBlockProps = {
  label: string;
  image: string;
  name: string;
  description: string;
  previewLink?: string;
  codeTemplateLink?: string;
  codeReference?: string;
  fields?: StarterBlockFieldProps[];
  code?: string | null;
};

const side_by_side_hero_image___code = `
<link href="https://block.codescandy.com/assets/css/theme.min.css" rel="stylesheet" />
<style>
	.stars-container {
		display: inline-block;
		font-size: 1rem;
		line-height: 1;
		color: #d5d6d8;
		position: relative;
	}

	.stars-container::before {
		content: "★★★★★";
		position: absolute;
		top: 0;
		left: 0;
		width: calc(var(--rating) / 5 * 100%);
		background: linear-gradient(90deg, #ffc107, #ffc107);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		z-index: 0;
		white-space: nowrap;
	}
</style>
<section class="py-md-10 pt-5 bg-primary bg-opacity-10 position-relative">
	<div class="container">
		<div class="row align-items-center py-lg-8">
			<div class="col-md-6 col-12">
				<div class="text-center text-md-start">
					<div class="mb-6 pe-xl-8">
						<h1 class="display-5">{{this.title}}</h1>
						<p class="lead">{{this.sub_title}}</p>
					</div>
					<div class="mb-7">
						<div class="mb-3">
							<a href="{{this.cta_button_1_url}}" class="btn btn-primary me-2">{{this.cta_button_1_text}}</a>
							<a href="{{this.cta_button_2_url}}" class="btn btn-white">{{this.cta_button_2_text}}</a>
						</div>
						<small>{{this.button_container_sub_text}}</small>
					</div>
					<div class="d-flex flex-column flex-lg-row align-items-center gap-2">
						<div class="text-dark mb-0 fs-6 lh-1 d-flex align-items-center">
							<span>{{this.star_rating_title}}</span>
							<span
								class="mx-1 stars-container"
								style="--rating: {{this.star_rating_number}}"
								aria-label="Rating of {{this.star_rating_number}} out of 5">
								★★★★★
							</span>
						</div>
					</div>
					<div class="mt-2 mt-lg-0"><span>{{this.star_rating_sub_text}}</span></div>
				</div>
			</div>
		</div>
		<div
			class="col-md-6 col-12 position-md-absolute top-0 end-0 left-0 h-100 mt-6 mt-md-0 px-0"
			style="
				background-image: url({{this.hero_image.getImage()}});
				background-size: cover;
				background-position: center;
			">
			<div class="d-block d-md-none">
				<figure class="figure">
					<img
						src="{{this.hero_image.getImage()}}"
						alt=""
						class="img-fluid" />
				</figure>
			</div>
		</div>
	</div>
</section>
`;

const hero_image_below___code = `
<link href="https://block.codescandy.com/assets/css/theme.min.css" rel="stylesheet" />
<section class="container py-lg-8 py-5" data-cue="fadeIn">
	<div class="row justify-content-center">
		<div class="col-xl-8 col-lg-10 col-12" data-cues="zoomIn" data-group="page-title" data-delay="700">
			<div class="text-center d-flex flex-column gap-5">
				<div class="d-flex justify-content-center">
					<a
						href="{{this.top_cta_button_url}}"
						class="bg-primary bg-opacity-10 text-primary border-primary border p-2 fs-6 rounded-pill lh-1 d-flex align-items-center">
						<span class="badge bg-primary">New</span>
						<span class="ms-2">{{this.top_cta_button_text}}</span>
						<span class="ms-1">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
								<path
									fill-rule="evenodd"
									clip-rule="evenodd"
									d="M1 8.89181C1 8.7592 1.05268 8.63202 1.14645 8.53825C1.24021 8.44448 1.36739 8.39181 1.5 8.39181H13.293L10.146 5.24581C10.0521 5.15192 9.99937 5.02458 9.99937 4.89181C9.99937 4.75903 10.0521 4.63169 10.146 4.53781C10.2399 4.44392 10.3672 4.39117 10.5 4.39117C10.6328 4.39117 10.7601 4.44392 10.854 4.53781L14.854 8.53781C14.9006 8.58425 14.9375 8.63943 14.9627 8.70017C14.9879 8.76092 15.0009 8.82604 15.0009 8.89181C15.0009 8.95757 14.9879 9.02269 14.9627 9.08344C14.9375 9.14418 14.9006 9.19936 14.854 9.24581L10.854 13.2458C10.7601 13.3397 10.6328 13.3924 10.5 13.3924C10.3672 13.3924 10.2399 13.3397 10.146 13.2458C10.0521 13.1519 9.99937 13.0246 9.99937 12.8918C9.99937 12.759 10.0521 12.6317 10.146 12.5378L13.293 9.39181H1.5C1.36739 9.39181 1.24021 9.33913 1.14645 9.24536C1.05268 9.15159 1 9.02441 1 8.89181Z"
									fill="#8B3DFF" />
							</svg>
						</span>
					</a>
				</div>
				<div class="d-flex flex-column gap-3 mx-lg-8">
					<h1 class="mb-0 display-4">{{this.title}}</h1>
					<p class="mb-0 lead">{{this.sub_title}}</p>
				</div>
				<div class="d-flex flex-row gap-4 justify-content-center">
					<a href="{{this.cta_button_1_url}}" class="btn btn-primary">{{this.cta_button_1_text}}</a>
					<a href="{{this.cta_button_2_url}}" class="icon-link icon-link-hover">
						<span>{{this.cta_button_2_text}}</span>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="14"
							height="14"
							fill="currentColor"
							class="bi bi-arrow-right"
							viewBox="0 0 16 16">
							<path
								fill-rule="evenodd"
								d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"></path>
						</svg>
					</a>
				</div>
			</div>
		</div>
	</div>
</section>
<div class="pattern-square"></div>
<section class="container py-lg-8 py-5">
	<div class="row justify-content-center">
		<div class="col-md-10 col-12">
			<div class="text-center position-relative" data-cue="zoomIn">
				<img
					src="{{this.hero_image.getImage()}}"
					class="img-fluid bg-light p-3 rounded-3 border"
					alt="" />
			
			</div>
		</div>
	</div>
</section>
`;

const contact_us_form___code = `
<link
  href="https://block.codescandy.com/assets/css/theme.min.css"
  rel="stylesheet"
/>
<section class="pattern-square bg-info bg-opacity-10">
  <div class="container position-relative z-1 py-xl-9 py-6">
    <div class="row">
      <div class="col-lg-10 offset-lg-1 col-md-12">
        <div class="row align-items-center g-5">
          <div class="col-lg-6 col-12 order-2">
            <div class="me-xl-7">
              <div class="mb-5">
                <h2 class="h1 mb-4">{{this.title}}</h2>
                <p class="mb-0 me-xl-7">
                  Book a free consultation call with one of our experts and get
                  help with your next moves. It's always good to talk to an
                  expert. It's free!
                </p>
              </div>
              <div class="mb-5">
                <ul class="list-unstyled">
                  <li class="mb-2 d-flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      class="bi bi-dot"
                      viewBox="0 0 16 16"
                    >
                      <path
                        d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"
                      ></path>
                    </svg>
                    <span class="ms-1"
                      >Not sure which technology to choose?</span
                    >
                  </li>
                  <li class="mb-2 d-flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      class="bi bi-dot"
                      viewBox="0 0 16 16"
                    >
                      <path
                        d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"
                      ></path>
                    </svg>
                    <span class="ms-1">Need advice on the next steps?</span>
                  </li>
                  <li class="mb-2 d-flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      class="bi bi-dot"
                      viewBox="0 0 16 16"
                    >
                      <path
                        d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"
                      ></path>
                    </svg>
                    <span class="ms-1"
                      >Hesitating on how to plan the execution?</span
                    >
                  </li>
                </ul>
              </div>
              <div class="d-md-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center mb-3 mb-md-0 small">
                  <div class="d-flex align-items-center">
                    <img
                      src="{{this.person_photo.getImage()}}"
                      alt="Avatar"
                      class="avatar avatar-lg rounded-circle"
                    />
                    <div class="ms-3">
                      <h5 class="mb-0">{{this.person_name}}</h5>
                      <small class="me-4">{{this.person_title}}</small>
                      <small>{{this.person_email}}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-6 col-12 order-lg-2">
            <div class="card shadow-sm">
              <div class="card-body">
                <form class="row needs-validation g-3" novalidate="">
                  <div class="col-lg-12">
                    <div class="mb-3">
                      <h3 class="mb-0">{{this.form_header_text}}</h3>
                    </div>
                  </div>
                  <div class="col-md-12">
                    <label for="scheduleEmailInput" class="form-label">
                      {{this.name}}
                      <span class="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      class="form-control"
                      id="scheduleEmailInput"
                      required=""
                    />
                    <div class="invalid-feedback">Please enter email.</div>
                  </div>
                  <div class="col-md-12">
                    <label for="scheduleEmailInput" class="form-label">
                      Email
                      <span class="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      class="form-control"
                      id="scheduleEmailInput"
                      required=""
                    />
                    <div class="invalid-feedback">Please enter email.</div>
                  </div>
                  <div class="col-md-12">
                    <label for="scheduleTextarea" class="form-label"
                      >Message</label
                    >
                    <textarea
                      class="form-control"
                      id="scheduleTextarea"
                      placeholder="Write to us"
                      rows="3"
                      required=""
                    >{{this.body_text}}</textarea>
                    <div class="invalid-feedback">Please write message.</div>
                  </div>
                  <div class="d-grid">
                    <button class="btn btn-primary" type="submit">
                      {{this.form_cta_button_text}}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
`;

const feature_side_by_side_image___code = `
<link href="https://block.codescandy.com/assets/css/theme.min.css" rel="stylesheet" />
<section class="my-xl-7 py-5">
	<div class="container">
		<div class="row align-items-center">
			<div class="col-lg-6 col-md-12 col-12 mb-md-3 mb-lg-0">
				<div>
					<a href="{{this.feature_intro_link}}" class="text-primary text-uppercase ls-md fw-semibold">
						{{this.feature_intro_text}}
					</a>
					<div class="mb-5 mt-4">
						<h2 class="mb-3">{{this.title}}</h2>
						<p class="mb-0 lead">
							{{this.sub_title}}
						</p>
					</div>

					<a href="{{this.cta_button_url}}" class="icon-link icon-link-hover">
						{{this.cta_button_text}}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="14"
							height="14"
							fill="currentColor"
							class="bi bi-arrow-right"
							viewBox="0 0 16 16">
							<path
								fill-rule="evenodd"
								d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z" />
						</svg>
					</a>
				</div>
			</div>
			<div class="col-lg-6 offset-lg-0 col-md-12 col-12">
				<div
					class="position-relative rellax"
					data-rellax-percentage="1"
					data-rellax-speed="0.8"
					data-disable-parallax-down="md">
					<figure>
						<img
							src="{{this.hero_image.getImage()}}"
							alt="landing"
							class="img-fluid rounded-4" />
					</figure>
				</div>
			</div>
		</div>
	</div>
</section>
`;

const single_testimonial___code = `
<link href="https://block.codescandy.com/assets/css/theme.min.css" rel="stylesheet" />
<section class="bg-light py-7">
	<div class="container py-4">
		<div class="col-xxl-8 offset-xxl-2 col-md-12">
			<div class="row align-items-center">
				<div class="col-md-4">
					<div class="mb-5 mb-lg-0">
						<img
							src="{{this.person_image.getImage()}}"
							alt="textmonial"
							class="img-fluid rounded-3" />
					</div>
				</div>
				<div class="col-md-8">
					<div class="mb-4">
						<p class="lead text-dark me-xl-6">
							“{{this.quote}}”
						</p>
					</div>
					<div class="d-flex justify-content-between">
						<div>
							<h5 class="mb-0">{{this.person_name}}</h5>
							<small>{{this.position}} @{{this.company_name}}</small>
							<br />
							<small>{{this.job_title}}</small>
						</div>
						<div>
							<figure>
								<img
									src="{{this.company_logo.getImage()}}"
									alt="brand" />
							</figure>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
`;

const OG_IMAGE_FIELD: StarterBlockFieldProps = {
  name: "og_image",
  label: "Meta Image",
  description:
    "This field allows you to set an open graph image via the SEO tab. An Open Graph (OG) image is an image that appears on a social media post when a web page is shared.",
  datatype: "images",
  settings: {
    defaultValue: null,
    group_id: "",
    limit: 1,
    list: false,
  },
};

const STARTER_BLOCKS: StarterBlockProps[] = [
  {
    label: "Blank",
    image: `${location.origin}/images/blockPlaceholder.png`,
    name: "blank",
    description: "A blank block",
    previewLink: "#",
    codeTemplateLink: "#",
    codeReference: "#",
    fields: [],
    code: null,
  },
  {
    label: "Side by Side Hero Image",
    image: `${location.origin}/images/block_hero_side_by_side_image.png`,
    name: "side_by_side_hero_image",
    description:
      "A hero with text and CTA buttons on the left and an image on the right",
    previewLink: "#",
    codeTemplateLink: "#",
    codeReference: "https://block.codescandy.com/blocks/hero-snippet-3.html",
    fields: [
      {
        name: "title",
        label: "Title",
        description: "The primary heading displayed in the left section.",
        datatype: "text",
        settings: {
          defaultValue: "Protect What Matters Most with ABC Insurance",
        },
      },
      {
        label: "Sub Title",
        name: "sub_title",
        description:
          "The supporting text displayed below the title in the left section.",
        datatype: "textarea",
        settings: {
          defaultValue:
            "Discover personalized insurance plans designed to secure your future and give you peace of mind.",
        },
      },
      {
        label: "CTA Button 1 Text",
        name: "cta_button_1_text",
        description:
          "The text for the first call-to-action button in the left section.",
        datatype: "text",
        settings: {
          defaultValue: "Get a Quote",
        },
      },
      {
        label: "CTA Button 1 URL",
        name: "cta_button_1_url",
        description: "The URL the first call-to-action button links to.",
        datatype: "link",
        settings: {
          defaultValue: "https://abcinsurance.com/get-a-quote",
        },
      },
      {
        label: "CTA Button 2 Text",
        name: "cta_button_2_text",
        description:
          "The text for the second call-to-action button in the left section.",
        datatype: "text",
        settings: {
          defaultValue: "Learn More",
        },
      },
      {
        label: "CTA Button 2 URL",
        name: "cta_button_2_url",
        description: "The URL the second call-to-action button links to.",
        datatype: "link",
        settings: {
          defaultValue: "https://abcinsurance.com/learn-more",
        },
      },
      {
        label: "Button Container Sub Text",
        name: "button_container_sub_text",
        description:
          "Supporting text below the call-to-action buttons in the left section.",
        datatype: "text",
        settings: {
          defaultValue: "No hidden fees, no obligations.",
        },
      },
      {
        label: "Hero Image",
        name: "hero_image",
        description:
          "The image displayed on the right side of the hero section.",
        datatype: "images",
        settings: {
          defaultValue: `${location.origin}/images/sb__hero__image__1.png`,
        },
      },
      {
        label: "Star Rating Number",
        name: "star_rating_number",
        description: "A numerical rating displayed in the hero section.",
        datatype: "number",
        settings: {
          defaultValue: "3.5",
        },
      },
      {
        label: "Star Rating Title",
        name: "star_rating_title",
        description: "A title describing the star rating.",
        datatype: "text",
        settings: {
          defaultValue: "Customer Satisfaction",
        },
      },
      {
        label: "Star Rating Sub Text",
        name: "star_rating_sub_text",
        description: "Additional details about the star rating.",
        datatype: "text",
        settings: {
          defaultValue: "Rated by 5,000+ happy customers.",
        },
      },
    ],
    code: side_by_side_hero_image___code,
  },
  {
    label: "Hero Image Below",
    name: "hero_image_below",
    description:
      "A hero with text and CTA buttons on the top and an image below",
    previewLink: "#",
    codeTemplateLink: "#",
    image: `${location.origin}/images/block_hero_image_below.png`,
    codeReference: "https://block.codescandy.com/blocks/hero-snippet-2.html",
    fields: [
      {
        label: "Top CTA Button Text",
        name: "top_cta_button_text",
        description: "The text for the top call-to-action button.",
        datatype: "text",
        settings: {
          defaultValue: "Get Started",
        },
      },
      {
        label: "Top CTA Button URL",
        name: "top_cta_button_url",
        description: "The URL the top call-to-action button links to.",
        datatype: "link",
        settings: {
          defaultValue: "https://abcinsurance.com/get-started",
        },
      },
      {
        name: "title",
        label: "Title",
        description: "The primary heading displayed in the hero section.",
        datatype: "text",
        settings: {
          defaultValue: "Secure Your Future with ABC Insurance",
        },
      },
      {
        label: "Sub Title",
        name: "sub_title",
        description:
          "The supporting text displayed below the title in the hero section.",
        datatype: "textarea",
        settings: {
          defaultValue: "Affordable plans tailored to your needs.",
        },
      },
      {
        label: "CTA Button 1 Text",
        name: "cta_button_1_text",
        description: "The text for the first call-to-action button",
        datatype: "text",
        settings: {
          defaultValue: "Get a Quote.",
        },
      },
      {
        label: "CTA Button 1 URL",
        name: "cta_button_1_url",
        description: "The URL the first call-to-action button links to.",
        datatype: "link",
        settings: {
          defaultValue: "https://abcinsurance.com/get-a-quote",
        },
      },
      {
        label: "CTA Button 2 Text",
        name: "cta_button_2_text",
        description: "The text for the second call-to-action button.",
        datatype: "text",
        settings: {
          defaultValue: "Learn More",
        },
      },
      {
        label: "CTA Button 2 URL",
        name: "cta_button_2_url",
        description: "The URL the second call-to-action button links to.",
        datatype: "link",
        settings: {
          defaultValue: "https://abcinsurance.com/learn-more",
        },
      },
      {
        label: "Hero Image",
        name: "hero_image",
        description: "The image displayed in the hero section.",
        datatype: "images",
        settings: {
          defaultValue: `${location.origin}/images/sb__hero__image__1.png`,
        },
      },
    ],
    code: hero_image_below___code,
  },
  {
    label: "Contact Us Form",
    name: "contact_us_form",
    description: "A simple contact us form to capture leads from any page",
    previewLink: "#",
    codeTemplateLink: "#",
    image: `${location.origin}/images/block_contact_us_form.png`,
    codeReference: "https://block.codescandy.com/contact-2.html",
    fields: [
      {
        label: "Title",
        name: "title",
        description: "The main heading for the contact us form.",
        datatype: "text",
        settings: {
          defaultValue: "Get in Touch",
        },
      },
      {
        label: "Body Text",
        name: "body_text",
        description:
          "A detailed text providing context or instructions for the form.",
        datatype: "textarea",
        settings: {
          defaultValue:
            "Have questions? Reach out to us, and we'll get back to you shortly.",
        },
      },
      {
        label: "Name",
        name: "name",
        description: "A label for the name input field.",
        datatype: "text",
        settings: {
          defaultValue: "Your Name",
        },
      },
      {
        label: "Person Name",
        name: "person_name",
        description: "The name of the primary contact person.",
        datatype: "text",
        settings: {
          defaultValue: "Sarah Johnson",
        },
      },
      {
        label: "Person Title",
        name: "person_title",
        description: "The title or role of the primary contact person.",
        datatype: "text",
        settings: {
          defaultValue: "Customer Support Specialist",
        },
      },
      {
        label: "Person Email",
        name: "person_email",
        description: "The email address of the primary contact person.",
        datatype: "text",
        settings: {
          defaultValue: "support@abcinsurance.com",
        },
      },
      {
        label: "Person Photo",
        name: "person_photo",
        description: "A photo of the primary contact person.",
        datatype: "images",
        settings: {
          defaultValue: `${location.origin}/images/sb__avatar__1.png`,
        },
      },
      {
        label: "Form Header Text",
        name: "form_header_text",
        description: "A subheading or introduction for the contact form.",
        datatype: "text",
        settings: {
          defaultValue: "We're here to help!",
        },
      },
      {
        label: "Form CTA Button Text",
        name: "form_cta_button_text",
        description: "The text for the call-to-action button on the form.",
        datatype: "text",
        settings: {
          defaultValue: "Submit",
        },
      },
    ],
    code: contact_us_form___code,
  },
  {
    label: "Feature Side By Side Image",
    name: "feature_side_by_side_image",
    description: "A feature with text on the left and image on the right",
    image: `${location.origin}/images/block_feature_side_by_side_image.png`,
    previewLink: "#",
    codeTemplateLink: "#",
    codeReference: "https://block.codescandy.com/blocks/features.html",
    fields: [
      {
        label: "Feature Intro Text",
        name: "feature_intro_text",
        description: "A short introductory text for the feature section.",
        datatype: "text",
        settings: {
          defaultValue: "Discover our unique insurance features",
        },
      },
      {
        label: "Feature Intro Link",
        name: "feature_intro_link",
        description: "The URL linked to the introductory feature text.",
        datatype: "link",
        settings: {
          defaultValue: "https://abcinsurance.com/features",
        },
      },
      {
        label: "Title",
        name: "title",
        description: "The main heading for the feature section.",
        datatype: "text",
        settings: {
          defaultValue: "Comprehensive Coverage Plans",
        },
      },
      {
        label: "Sub Title",
        name: "sub_title",
        description:
          "The supporting text providing more detail about the feature.",
        datatype: "textarea",
        settings: {
          defaultValue:
            "Tailored insurance plans to fit your needs and budget, giving you complete peace of mind.",
        },
      },
      {
        label: "CTA Button Text",
        name: "cta_button_text",
        description:
          "The text for the call-to-action button in the feature section.",
        datatype: "text",
        settings: {
          defaultValue: "Learn About Features",
        },
      },
      {
        label: "CTA Button URL",
        name: "cta_button_url",
        description: "The URL the call-to-action button links to.",
        datatype: "link",
        settings: {
          defaultValue: "https://abcinsurance.com/learn-features",
        },
      },
      {
        label: "Hero Image",
        name: "hero_image",
        description: "The image displayed alongside the feature section.",
        datatype: "images",
        settings: {
          defaultValue: `${location.origin}/images/sb__hero__image__2.png`,
        },
      },
    ],
    code: feature_side_by_side_image___code,
  },
  {
    label: "Single Testimonial",
    name: "single_testimonial",
    description:
      "A single testimonial quote with a person's name, image, and company details",
    image: `${location.origin}/images/block_single_testimonial.png`,
    previewLink: "#",
    codeTemplateLink: "#",
    codeReference: "https://block.codescandy.com/blocks/testimonails.html",
    fields: [
      {
        label: "Quote",
        name: "quote",
        description: "The testimonial or quote provided by a person.",
        datatype: "textarea",
        settings: {
          defaultValue:
            "ABC Insurance has transformed my life with its reliable and affordable plans.",
        },
      },
      {
        label: "Person Image",
        name: "person_image",
        description: "The image of the person providing the quote.",
        datatype: "images",
        settings: {
          defaultValue: `${location.origin}/images/sb__person__image__1.png`,
        },
      },
      {
        label: "Person Name",
        name: "person_name",
        description: "The name of the person providing the quote.",
        datatype: "text",
        settings: {
          defaultValue: "John Doe",
        },
      },
      {
        label: "Job Title",
        name: "job_title",
        description: "The job title of the person providing the quote.",
        datatype: "text",
        settings: {
          defaultValue: "Financial Advisor",
        },
      },
      {
        label: "Position",
        name: "position",
        description: "The person's position in their company.",
        datatype: "text",
        settings: {
          defaultValue: "Senior Manager",
        },
      },
      {
        label: "Company Name",
        name: "company_name",
        description: "The name of the company the person represents.",
        datatype: "text",
        settings: {
          defaultValue: "ABC Insurance",
        },
      },
      {
        label: "Company Logo",
        name: "company_logo",
        description: "The logo of the company the person represents.",
        datatype: "images",
        settings: {
          defaultValue: `${location.origin}/images/sb__company__logo__1.png`,
        },
      },
    ],
    code: single_testimonial___code,
  },
];

export {
  StarterBlockFieldProps,
  StarterBlockProps,
  STARTER_BLOCKS,
  OG_IMAGE_FIELD,
};
