import { CreateUserParams, GetMenuParams, SignInParams } from "@/types";
import { Account, Avatars, Client, Databases, ID, Query, Storage } from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  platform: "com.dd.foodordering",
  databaseId: "686bfcd80032ef44fc7a",
  bucketId: "686d589a00300263a8db",
  userCollectionId: "686bfcf500069596c372",
  categoriesCollectionId: "686d55c7003125dc1471",
  menuCollectionId: "686d564a00306d9e5e72",
  customizationsCollectionId: "686d5728003bd453bb95",
  menuCustomizationsCollectionId: "686d57d70017554bf44a",
};

export const client = new Client();

client.setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId).setPlatform(appwriteConfig.platform);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
const avatars = new Avatars(client);

export const createUser = async ({ email, password, name }: CreateUserParams) => {
  try {
    const newAccount = await account.create(ID.unique(), email, password, name);

    if (!newAccount) throw Error;

    await signIn({ email, password });

    const avatarUrl = avatars.getInitialsURL(name);

    return await databases.createDocument(appwriteConfig.databaseId, appwriteConfig.userCollectionId, ID.unique(), { accountId: newAccount.$id, email, name, avatar: avatarUrl });
  } catch (e) {
    throw new Error(e as string);
  }
};

export const signIn = async ({ email, password }: SignInParams) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);
  } catch (e) {
    throw new Error(e as string);
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.userCollectionId, [Query.equal("accountId", currentAccount.$id)]);

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (e) {
    console.log(e);
    throw new Error(e as string);
  }
};

export const getMenu = async ({ category, query }: GetMenuParams) => {
  try {
    const queries: string[] = [];

    if (category) queries.push(Query.equal("categories", category));
    if (query) queries.push(Query.search("name", query));

    const menus = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.menuCollectionId, queries);

    return menus.documents;
  } catch (e) {
    throw new Error(e as string);
  }
};

export const getCategories = async () => {
  try {
    const categories = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.categoriesCollectionId);

    return categories.documents;
  } catch (e) {
    throw new Error(e as string);
  }
};
