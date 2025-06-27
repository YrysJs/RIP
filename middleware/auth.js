import Cookies from 'js-cookie';
export default defineNuxtRouteMiddleware((to) => {
    const router = useRouter();

    if (!Cookies.get('token')) router.push('/');
});
