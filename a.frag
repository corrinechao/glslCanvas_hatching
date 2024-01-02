
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_tex0; // MonaLisa

vec2 hash2(vec2 x)
{
    const vec2 k = vec2(0.3183099, 0.3678794);
    x = x * k + k.yx;
    return fract(16.0 * k * fract(x.x * x.y * (x.x + x.y)));
}

float gnoise(vec2 p)
{
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
                   dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
               mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
                   dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
}

float texh(in vec2 p, in float str)
{
    float rz = 1.0;
    int j = 20;
    for (int i = 0; i < 20; i++)
    {
        float pas = float(i) / float(j);
        float g = gnoise(vec2(1., 80.) * p);
        g = smoothstep(0.05, 0.3, g);
        p.xy = p.yx;
        p += 0.07;
        p *= 1.2;
        rz = min(1. - g, rz);
        if (1.0 - pas < str)
            break;
    }
    return rz;
}

// Function to calculate the glossy reflection
vec3 calculateGlossy(vec2 uv, vec2 reflectionDir, float roughness)
{
    float fresnel = pow(1.0 - dot(reflectionDir, vec2(0.0, 1.0)), 5.0);
    vec3 reflectionColor = texture2D(u_tex0, uv).rgb;

    // Adjust the reflection based on roughness
    float glossyFactor = exp(-1.0 * roughness * roughness);
    vec3 glossyReflection = mix(reflectionColor, vec3(1.0), glossyFactor);

    return mix(reflectionColor, glossyReflection, fresnel);
}

void main()
{
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float breathing = (exp(sin(u_time / 6.0 * 3.14159)) - 0.36787944) * 0.42545906412;

    float info = texture2D(u_tex0, uv).g;
    vec3 col = vec3(texh(uv * 6.0, info + 0.3 - breathing * 0.2));

    // Calculate glossy reflection
    vec2 reflectionDir = reflect(uv - vec2(0.6), vec2(0.3, 1.0));
    vec3 glossyColor = calculateGlossy(uv, reflectionDir, 0.1);

    // Mix the original color with the glossy reflection
    col = mix(col, glossyColor, 0.5);

    gl_FragColor = vec4(col, 0.5);
}

