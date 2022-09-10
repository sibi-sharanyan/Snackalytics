export interface ZomatoOrder {
    title: string;
    details: Details;
}

interface Details {
    isInvalid: number;
    order: Order;
    rating: number;
    orderId: number;
    ratingV2: number;
    bgColorV2: BgColorV2;
    hashId: string;
    orderDate: string;
    paymentMethod: string;
    paymentMethodString: string;
    statusText: string;
    orderSummeryString: string;
    deliveryDetails: DeliveryDetails;
    userPhone: string;
    maskedUserPhone: string;
    resInfo: ResInfo;
    currentStatus: string;
    isOrderTrackable: number;
    refundDetails: any[];
    fssai_details: Fssaidetails;
    showReorderButton: boolean;
    isFavourite: number;
    reOrderUrl: string;
    currency: string;
}

interface Fssaidetails {
    title: string;
    text: string;
    image: string;
}

interface ResInfo {
    id: number;
    name: string;
    thumb: string;
    rating: Rating;
    ratingData: RatingData;
    resUrl: string;
    resPath: string;
    phone: Phone;
    establishment: any[];
    locality: Locality;
    isBookmarked: boolean;
}

interface Locality {
    cityId: number;
    localityName: string;
    localityUrl: string;
    addressString: string;
    directionTitle: string;
    directionUrl: string;
}

interface Phone {
    phone_string: string;
    isACD: boolean;
    isDirect: boolean;
    mobile_string: string;
    mobile_string_display: string;
    phone_string_available: number;
}

interface RatingData {
    header: string;
    options: Option[];
    selected: string;
}

interface Option {
    value: string;
    label: string;
}

interface Rating {
    has_fake_reviews: number;
    aggregate_rating: string;
    rating_text: string;
    rating_subtitle: string;
    rating_color: string;
    votes: string;
    subtext: string;
    is_new: boolean;
}

interface DeliveryDetails {
    deliveryAddress: string;
    maskedDeliveryAddress: string;
    deliveryStatus: number;
    deliveryMessage: string;
    deliveryLabel: string;
}

interface BgColorV2 {
    type: string;
    tint: string;
}

interface Order {
    totalCost: number;
    items: Items;
    isPlanPurchased: boolean;
    isTreatDishAddedWithCart: boolean;
    treatDishObj: any[];
    treatSubscriptionId: number;
    status: number;
    deliveryStatus: number;
    deliveryMode: string;
    popupItems: any[];
    cancellation_popup_items: any[];
}

interface Items {
    item_total: Itemtotal[];
    dish: Dish[];
    subtotal2: Dish[];
    voucher_discount: Dish[];
    charge: Dish[];
    donations: Dish[];
    total_user: Dish[];
    savings: Saving[];
}

interface Saving {
    id: number;
    itemName: string;
    itemNameColor: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
    displayCost: string;
    displayCostColor: string;
    comment: string;
    type: string;
    mrpItem: number;
    tagIds: string;
    isHidden: number;
    deterSendingItem: number;
    orderDishType: string;
    freeQuantity: number;
    itemType: string;
    bgColor: string;
    groups: any[];
    actualDisplayCost: string;
    noPopup: boolean;
    popupOnly: boolean;
    summary: boolean;
    sendInCart: number;
    borderColor: string;
    isCancelled: number;
    genericPopupItems: any[];
    topSeparator: number;
    bottomSeparator: number;
    identifier: string;
    associatedWithRes: boolean;
}

export interface Dish {
    orderItemId: number;
    id: number;
    itemName: string;
    itemNameColor: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
    displayCost: string;
    displayCostColor: string;
    comment: string;
    type: string;
    mrpItem: number;
    tagIds: string;
    tagSlugs: string[];
    isHidden: number;
    deterSendingItem: number;
    orderDishType: string;
    freeQuantity: number;
    itemType: string;
    groups: any[];
    actualDisplayCost: string;
    noPopup: boolean;
    popupOnly: boolean;
    summary: boolean;
    sendInCart: number;
    borderColor: string;
    isCancelled: number;
    genericPopupItems: any[];
    topSeparator: number;
    bottomSeparator: number;
    identifier: string;
    associatedWithRes: boolean;
}

interface Itemtotal {
    id: number;
    itemName: string;
    itemNameColor: string;
    quantity: number;
    totalCost: number;
    displayCost: string;
    displayCostColor: string;
    type: string;
    mrpItem: number;
    tagIds: string;
    isHidden: number;
    deterSendingItem: number;
    orderDishType: string;
    freeQuantity: number;
    itemType: string;
    groups: any[];
    actualDisplayCost: string;
    noPopup: boolean;
    popupOnly: boolean;
    summary: boolean;
    sendInCart: number;
    borderColor: string;
    isCancelled: number;
    genericPopupItems: any[];
    topSeparator: number;
    bottomSeparator: number;
    identifier: string;
    associatedWithRes: boolean;
}



export interface IHighestOrder {
    name: string;
    totalCost: number;
}